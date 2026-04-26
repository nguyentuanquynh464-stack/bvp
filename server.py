from flask import Flask, request, jsonify
import math
from datetime import datetime, timedelta
import pandas as pd

app = Flask(__name__)

@app.after_request
def add_cors(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
    return response

# ═══════════════════════════════════════
# Model 1 — fetch DJI range + compute omega dynamically
# ═══════════════════════════════════════
def _fetch_dji_range(start_str, end_str):
    import yfinance as yf
    start_dt = datetime.strptime(start_str, '%Y-%m-%d')
    end_dt   = datetime.strptime(end_str,   '%Y-%m-%d')
    fetch_s  = (start_dt - timedelta(days=7)).strftime('%Y-%m-%d')
    fetch_e  = (end_dt   + timedelta(days=8)).strftime('%Y-%m-%d')
    dji = yf.download('^DJI', start=fetch_s, end=fetch_e,
                      auto_adjust=True, progress=False)
    closes = dji[('Close', '^DJI')].dropna()
    if len(closes) == 0:
        raise ValueError(f'Khong co du lieu DJI cho khoang {start_str} - {end_str}')
    start_ts = pd.Timestamp(start_dt)
    end_ts   = pd.Timestamp(end_dt)
    after    = closes.index[closes.index >= start_ts]
    before   = closes.index[closes.index <= end_ts]
    if len(after) == 0 or len(before) == 0:
        raise ValueError('Ngay chon nam ngoai du lieu giao dich')
    actual_s = after[0]
    actual_e = before[-1]
    if actual_s > actual_e:
        raise ValueError('Khoang ngay qua ngan, khong co ngay giao dich nao')
    mask  = (closes.index >= actual_s) & (closes.index <= actual_e)
    raw   = closes[mask].values.tolist()
    if len(raw) < 2:
        raise ValueError('Can it nhat 2 ngay giao dich trong khoang da chon')
    prices = [math.floor(p) / 1000 for p in raw]
    return (prices, prices[0], prices[-1],
            actual_s.strftime('%Y-%m-%d'), actual_e.strftime('%Y-%m-%d'))

def _compute_omega(prices):
    n    = len(prices)
    mean = sum(prices) / n
    x    = [v - mean for v in prices]
    max_mag = 0.0; max_k = 1
    for k in range(1, n):
        re = 0.0; im = 0.0
        for j in range(n):
            angle = -2 * math.pi * k * j / n
            re += x[j] * math.cos(angle)
            im += x[j] * math.sin(angle)
        mag = math.sqrt(re * re + im * im)
        if mag > max_mag:
            max_mag = mag; max_k = k
    return 2 * math.pi * max_k / n

# ═══════════════════════════════════════
# Utility
# ═══════════════════════════════════════
def linspace(a, b, n):
    return [a + i * (b - a) / (n - 1) for i in range(n)]

def solve_gen(A, bv, n):
    M = [list(A[i]) + [bv[i]] for i in range(n)]
    for c in range(n):
        mx = c
        for r in range(c + 1, n):
            if abs(M[r][c]) > abs(M[mx][c]):
                mx = r
        M[c], M[mx] = M[mx], M[c]
        if abs(M[c][c]) < 1e-15:
            continue
        for r in range(c + 1, n):
            f = M[r][c] / M[c][c]
            for j in range(c, n + 1):
                M[r][j] -= f * M[c][j]
    x = [0.0] * n
    for i in range(n - 1, -1, -1):
        s = M[i][n]
        for j in range(i + 1, n):
            s -= M[i][j] * x[j]
        x[i] = s / M[i][i]
    return x

# ═══════════════════════════════════════
# Core BVP Methods: FDM, SM, FEM
# ═══════════════════════════════════════
def g_fdm(a, b, al, bt, N, pF, qF, rF):
    h = (b - a) / (N - 1)
    t = linspace(a, b, N)
    n = N - 2
    A = [[0.0] * n for _ in range(n)]
    bv = [0.0] * n
    for i in range(1, N - 1):
        ro = i - 1
        ti = t[i]
        if ro > 0:
            A[ro][ro - 1] = -1 - (h / 2) * rF(ti)
        A[ro][ro] = 2 + h * h * qF(ti)
        if ro < n - 1:
            A[ro][ro + 1] = -(1 - (h / 2) * rF(ti))
        rhs = -h * h * pF(ti)
        if i == 1:
            rhs += (1 + (h / 2) * rF(ti)) * al
        if i == N - 2:
            rhs += (1 - (h / 2) * rF(ti)) * bt
        bv[ro] = rhs
    interior = solve_gen(A, bv, n)
    return {'t': t, 'y': [al] + interior + [bt]}

def g_sm(a, b, al, bt, N, fS, s1, s2):
    h = (b - a) / (N - 1)
    t = linspace(a, b, N)

    def rk4(s):
        w = [al, s]
        ys = [al]
        for k in range(N - 1):
            tk = t[k]
            K1 = fS(tk, w)
            K2 = fS(tk + h / 2, [w[0] + h / 2 * K1[0], w[1] + h / 2 * K1[1]])
            K3 = fS(tk + h / 2, [w[0] + h / 2 * K2[0], w[1] + h / 2 * K2[1]])
            K4 = fS(tk + h, [w[0] + h * K3[0], w[1] + h * K3[1]])
            w = [
                w[0] + h / 6 * (K1[0] + 2 * K2[0] + 2 * K3[0] + K4[0]),
                w[1] + h / 6 * (K1[1] + 2 * K2[1] + 2 * K3[1] + K4[1]),
            ]
            ys.append(w[0])
        return ys

    p1 = rk4(s1)[N - 1]
    p2 = rk4(s2)[N - 1]
    s = s1 if abs(p2 - p1) < 1e-15 else s1 + (s2 - s1) * (bt - p1) / (p2 - p1)
    return {'t': t, 'y': rk4(s)}

def g_fem(a, b, al, bt, N, pF, qF, gF):
    t = linspace(a, b, N)
    nq = 100
    A = [[0.0] * N for _ in range(N)]
    bv = [0.0] * N

    def trp(fn, xl, xr):
        xs = linspace(xl, xr, nq + 1)
        s = 0.0
        for i in range(nq):
            s += (fn(xs[i]) + fn(xs[i + 1])) * ((xr - xl) / nq / 2)
        return s

    for i in range(N - 1):
        xl = t[i]
        xr = t[i + 1]
        he = xr - xl

        def p0(x, _xr=xr, _he=he): return (_xr - x) / _he
        def p1x(x, _xl=xl, _he=he): return (x - _xl) / _he

        d0 = -1 / he
        d1 = 1 / he
        kd = [[1 / he, -1 / he], [-1 / he, 1 / he]]

        ip0 = trp(lambda x, _p0=p0: pF(x) * _p0(x), xl, xr)
        ip1 = trp(lambda x, _p1x=p1x: pF(x) * _p1x(x), xl, xr)
        kp = [[-d0 * ip0, -d1 * ip0], [-d0 * ip1, -d1 * ip1]]

        q00 = trp(lambda x, _p0=p0: qF(x) * _p0(x) * _p0(x), xl, xr)
        q01 = trp(lambda x, _p0=p0, _p1x=p1x: qF(x) * _p0(x) * _p1x(x), xl, xr)
        q10 = trp(lambda x, _p0=p0, _p1x=p1x: qF(x) * _p1x(x) * _p0(x), xl, xr)
        q11 = trp(lambda x, _p1x=p1x: qF(x) * _p1x(x) * _p1x(x), xl, xr)
        kq = [[-q00, -q01], [-q10, -q11]]

        g0 = trp(lambda x, _p0=p0: gF(x) * _p0(x), xl, xr)
        g1 = trp(lambda x, _p1x=p1x: gF(x) * _p1x(x), xl, xr)

        for r in range(2):
            for c in range(2):
                A[i + r][i + c] += kd[r][c] + kp[r][c] + kq[r][c]
        bv[i] += -g0
        bv[i + 1] += -g1

    for j in range(N): A[0][j] = 0.0
    A[0][0] = 1.0; bv[0] = al
    for j in range(N): A[N - 1][j] = 0.0
    A[N - 1][N - 1] = 1.0; bv[N - 1] = bt

    return {'t': t, 'y': solve_gen(A, bv, N)}

def calc_err(ys, t, yE):
    return max(abs(ys[i] - yE(t[i])) for i in range(len(ys)))

# ═══════════════════════════════════════
# Model Solvers
# ═══════════════════════════════════════
def solve_m1(a, b, ya, yb, N, w):
    det = math.cos(w * a) * math.sin(w * b) - math.cos(w * b) * math.sin(w * a)
    if abs(det) < 1e-12:
        Ac = ya; Bc = 0.0
    else:
        Ac = (ya * math.sin(w * b) - yb * math.sin(w * a)) / det
        Bc = (-ya * math.cos(w * b) + yb * math.cos(w * a)) / det

    def yE(t_val, _Ac=Ac, _Bc=Bc, _w=w):
        return _Ac * math.cos(_w * t_val) + _Bc * math.sin(_w * t_val)

    fdm = g_fdm(a, b, ya, yb, N, lambda t: 0.0, lambda t: -w * w, lambda t: 0.0)
    sScale = (abs(ya) + abs(yb) + 1) * w
    sm = g_sm(a, b, ya, yb, N, lambda t, y: [y[1], -w * w * y[0]], -sScale, sScale)
    fem = g_fem(a, b, ya, yb, N, lambda t: 0.0, lambda t: w * w, lambda t: 0.0)

    tEx = linspace(a, b, 300)
    yEx = [yE(v) for v in tEx]

    return {
        'fdm': fdm, 'sm': sm, 'fem': fem,
        'tEx': tEx, 'yEx': yEx,
        'eF': calc_err(fdm['y'], fdm['t'], yE),
        'eS': calc_err(sm['y'], sm['t'], yE),
        'eE': calc_err(fem['y'], fem['t'], yE),
        'w': w, 'Ac': Ac, 'Bc': Bc,
        'a': a, 'b': b, 'ya': ya, 'yb': yb,
    }

def solve_m2(mV, kV, Aa, N):
    w = math.sqrt(kV / mV)
    a = 0.0; bv_val = 1.0; al = 0.0; bt = 0.0

    def yE(t_val, _Aa=Aa, _w=w):
        return _Aa * math.sin(_w * t_val)

    h = (bv_val - a) / (N - 1)
    t = linspace(a, bv_val, N)
    n = N - 2
    Am = [[0.0] * n for _ in range(n)]
    bvv = [0.0] * n
    for i in range(1, N - 1):
        r = i - 1
        bi = 2 - h * h * w * w
        if r > 0: Am[r][r - 1] = -1.0
        Am[r][r] = bi
        if r < n - 1: Am[r][r + 1] = -1.0
        rhs = 0.0
        if i == 1: rhs += al
        if i == N - 2: rhs += bt
        bvv[r] = rhs
    iM = max(0, min(n - 1, round(0.5 / h) - 1))
    for j in range(n): Am[iM][j] = 0.0
    Am[iM][iM] = 1.0; bvv[iM] = yE(t[iM + 1])
    fdm = {'t': t, 'y': [al] + solve_gen(Am, bvv, n) + [bt]}

    nHalf = max(1, round((N - 1) / 2))

    def rk4_step(wk, tk):
        def f(tt, y): return [y[1], -w * w * y[0]]
        K1 = f(tk, wk)
        K2 = f(tk + h / 2, [wk[0] + h / 2 * K1[0], wk[1] + h / 2 * K1[1]])
        K3 = f(tk + h / 2, [wk[0] + h / 2 * K2[0], wk[1] + h / 2 * K2[1]])
        K4 = f(tk + h, [wk[0] + h * K3[0], wk[1] + h * K3[1]])
        return [
            wk[0] + h / 6 * (K1[0] + 2 * K2[0] + 2 * K3[0] + K4[0]),
            wk[1] + h / 6 * (K1[1] + 2 * K2[1] + 2 * K3[1] + K4[1]),
        ]

    def shoot_to_mid(s):
        wk = [al, s]
        for k in range(nHalf): wk = rk4_step(wk, t[k])
        return wk[0]

    s1 = 0.0; p1 = shoot_to_mid(s1)
    s2 = Aa * w * 2; p2 = shoot_to_mid(s2)
    sOpt = s1 + (s2 - s1) * (Aa - p1) / (p2 - p1) if abs(p2 - p1) > 1e-15 else Aa * w
    wk = [al, sOpt]; sY = [al]
    for k in range(N - 1):
        wk = rk4_step(wk, t[k]); sY.append(wk[0])
    sm = {'t': t, 'y': sY}

    Af = [[0.0] * N for _ in range(N)]
    bf = [0.0] * N

    def trp(fn, xl, xr):
        xs = linspace(xl, xr, 101)
        sv = 0.0
        for i in range(100):
            sv += (fn(xs[i]) + fn(xs[i + 1])) * ((xr - xl) / 100 / 2)
        return sv

    for i in range(N - 1):
        xl = t[i]; xr = t[i + 1]; he = xr - xl
        def p0(x, _xr=xr, _he=he): return (_xr - x) / _he
        def p1x(x, _xl=xl, _he=he): return (x - _xl) / _he
        kd = [[1 / he, -1 / he], [-1 / he, 1 / he]]
        q00 = trp(lambda x, _p0=p0: w * w * _p0(x) * _p0(x), xl, xr)
        q01 = trp(lambda x, _p0=p0, _p1x=p1x: w * w * _p0(x) * _p1x(x), xl, xr)
        q10 = trp(lambda x, _p0=p0, _p1x=p1x: w * w * _p1x(x) * _p0(x), xl, xr)
        q11 = trp(lambda x, _p1x=p1x: w * w * _p1x(x) * _p1x(x), xl, xr)
        for r in range(2):
            for c in range(2):
                Af[i + r][i + c] += kd[r][c] - [[q00, q01], [q10, q11]][r][c]

    for j in range(N): Af[0][j] = 0.0
    Af[0][0] = 1.0; bf[0] = al
    for j in range(N): Af[N - 1][j] = 0.0
    Af[N - 1][N - 1] = 1.0; bf[N - 1] = bt
    iMf = min(N - 1, round(0.5 / h))
    for j in range(N): Af[iMf][j] = 0.0
    Af[iMf][iMf] = 1.0; bf[iMf] = yE(t[iMf])
    fem = {'t': t, 'y': solve_gen(Af, bf, N)}

    tEx = linspace(a, bv_val, 200)
    yEx = [yE(v) for v in tEx]

    return {
        'fdm': fdm, 'sm': sm, 'fem': fem,
        'tEx': tEx, 'yEx': yEx,
        'eF': calc_err(fdm['y'], fdm['t'], yE),
        'eS': calc_err(sm['y'], sm['t'], yE),
        'eE': calc_err(fem['y'], fem['t'], yE),
        'w': w, 'A_amp': Aa,
    }

def solve_m3(r1, T1, r2, T2, N):
    C1 = (T1 - T2) / (1 / r1 - 1 / r2)
    C2 = T1 - C1 / r1

    def yE(r_val, _C1=C1, _C2=C2): return _C1 / r_val + _C2

    fdm = g_fdm(r1, r2, T1, T2, N, lambda r: 0.0, lambda r: 0.0, lambda r: -2 / r)
    sm = g_sm(r1, r2, T1, T2, N, lambda r, y: [y[1], -(2 / r) * y[1]], -1.0, 1.0)
    fem = g_fem(r1, r2, T1, T2, N, lambda r: 2 / r, lambda r: 0.0, lambda r: 0.0)

    tEx = linspace(r1, r2, 200)
    yEx = [yE(r) for r in tEx]

    return {
        'fdm': fdm, 'sm': sm, 'fem': fem,
        'tEx': tEx, 'yEx': yEx,
        'eF': calc_err(fdm['y'], fdm['t'], yE),
        'eS': calc_err(sm['y'], sm['t'], yE),
        'eE': calc_err(fem['y'], fem['t'], yE),
        'C1': C1, 'C2': C2,
    }

def solve_m4(K0, KT, Te, N):
    def yE(t_val, _K0=K0, _KT=KT, _Te=Te): return (_KT - _K0) * (t_val / _Te) + _K0

    fdm = g_fdm(0.0, Te, K0, KT, N, lambda t: 0.0, lambda t: 0.0, lambda t: 0.0)
    sm = g_sm(0.0, Te, K0, KT, N, lambda t, y: [y[1], 0.0], 0.0, 2.0)
    fem = g_fem(0.0, Te, K0, KT, N, lambda t: 0.0, lambda t: 0.0, lambda t: 0.0)

    tEx = linspace(0.0, Te, 200)
    yEx = [yE(v) for v in tEx]

    return {
        'fdm': fdm, 'sm': sm, 'fem': fem,
        'tEx': tEx, 'yEx': yEx,
        'eF': calc_err(fdm['y'], fdm['t'], yE),
        'eS': calc_err(sm['y'], sm['t'], yE),
        'eE': calc_err(fem['y'], fem['t'], yE),
        'K0': K0, 'KT': KT,
    }

# ═══════════════════════════════════════
# Flask API
# ═══════════════════════════════════════
@app.route('/')
def home():
    return "Server is running"
@app.route('/solve', methods=['POST', 'OPTIONS'])
def solve():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    model_id = data.get('modelId')
    N = int(data.get('N', 30))
    try:
        if model_id == 1:
            start_str = data['startDate']
            end_str   = data['endDate']
            start_dt  = datetime.strptime(start_str, '%Y-%m-%d')
            end_dt    = datetime.strptime(end_str,   '%Y-%m-%d')

            prices, ya, yb, actual_start, actual_end = _fetch_dji_range(start_str, end_str)
            w = _compute_omega(prices)

            T = max(1, (end_dt - start_dt).days)
            a = start_dt.day
            b = a + T

            result = solve_m1(a, b, ya, yb, N, w)
            result['actualStart'] = actual_start
            result['actualEnd']   = actual_end
        elif model_id == 2:
            result = solve_m2(float(data['m']), float(data['k']),
                              float(data['A']), N)
        elif model_id == 3:
            result = solve_m3(float(data['r1']), float(data['T1']),
                              float(data['r2']), float(data['T2']), N)
            result['r1v'] = float(data['r1']); result['T1v'] = float(data['T1'])
            result['r2v'] = float(data['r2']); result['T2v'] = float(data['T2'])
        elif model_id == 4:
            result = solve_m4(float(data['K0']), float(data['KT']),
                              float(data['Te']), N)
        else:
            return jsonify({'error': 'Invalid modelId'}), 400
        result['mdl'] = model_id
        return jsonify(result)
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({'error': str(e)}), 500

import os
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)
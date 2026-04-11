export default function TropicalBackground() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="lf1" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#4aad30" />
          <stop offset="60%" stopColor="#1f6e14" />
          <stop offset="100%" stopColor="#0a2e08" />
        </linearGradient>
        <linearGradient id="lf2" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#3a9424" />
          <stop offset="60%" stopColor="#175c0f" />
          <stop offset="100%" stopColor="#082208" />
        </linearGradient>
        <linearGradient id="lf3" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#2d7a1c" />
          <stop offset="100%" stopColor="#061806" />
        </linearGradient>
        <linearGradient id="lf4" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#1e5c12" />
          <stop offset="100%" stopColor="#041004" />
        </linearGradient>
        <radialGradient id="bgGlow" cx="50%" cy="35%" r="55%">
          <stop offset="0%" stopColor="#0d2e0a" stopOpacity="1" />
          <stop offset="100%" stopColor="#030803" stopOpacity="1" />
        </radialGradient>
        <radialGradient id="centerDark" cx="50%" cy="50%" r="40%">
          <stop offset="0%" stopColor="#030803" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#030803" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Base background */}
      <rect width="1440" height="900" fill="url(#bgGlow)" />

      {/* ===== PALMERA IZQUIERDA PRINCIPAL ===== */}
      {/* Tronco */}
      <path d="M 60,905 Q 75,720 88,560 Q 96,430 110,310"
        stroke="#1a3d0a" strokeWidth="26" fill="none" strokeLinecap="round" />
      <path d="M 60,905 Q 75,720 88,560 Q 96,430 110,310"
        stroke="#0d2006" strokeWidth="10" fill="none" strokeLinecap="round" strokeDasharray="35 22" />

      {/* Hoja 1: arriba-izquierda */}
      <path d="M 110,310 C 88,278 52,240 18,182 C 2,152 -14,110 2,68
               C 18,102 36,145 64,188 C 85,222 100,268 110,305 Z"
        fill="url(#lf1)" opacity="0.95" />
      {/* Hoja 2: izquierda */}
      <path d="M 110,310 C 62,302 4,282 -46,252 C -88,226 -130,190 -144,148
               C -112,172 -70,202 -22,230 C 22,252 68,276 108,306 Z"
        fill="url(#lf2)" opacity="0.9" />
      {/* Hoja 3: arriba-centro */}
      <path d="M 110,310 C 100,268 90,212 96,148 C 102,94 114,50 130,14
               C 136,56 130,110 126,168 C 122,218 118,270 114,308 Z"
        fill="url(#lf1)" opacity="0.9" />
      {/* Hoja 4: arriba-derecha */}
      <path d="M 110,310 C 148,274 202,234 262,202 C 310,176 368,160 408,154
               C 372,170 320,192 272,224 C 220,258 168,294 118,308 Z"
        fill="url(#lf2)" opacity="0.88" />
      {/* Hoja 5: derecha */}
      <path d="M 110,310 C 168,298 238,276 308,252 C 368,232 424,206 462,172
               C 424,200 368,230 306,255 C 236,282 166,304 116,312 Z"
        fill="url(#lf3)" opacity="0.82" />
      {/* Hoja 6: abajo-izquierda */}
      <path d="M 110,310 C 72,332 28,364 -8,406 C -34,438 -50,476 -36,508
               C -16,476 10,444 46,414 C 72,390 98,356 112,320 Z"
        fill="url(#lf2)" opacity="0.72" />
      {/* Hoja pequeña extra arriba */}
      <path d="M 110,310 C 98,282 78,248 48,224 C 24,204 -4,192 -20,178
               C -2,186 22,198 46,220 C 76,246 98,280 112,308 Z"
        fill="url(#lf3)" opacity="0.7" />

      {/* ===== PALMERA DERECHA PRINCIPAL ===== */}
      <path d="M 1380,905 Q 1365,720 1352,560 Q 1344,430 1330,310"
        stroke="#1a3d0a" strokeWidth="26" fill="none" strokeLinecap="round" />
      <path d="M 1380,905 Q 1365,720 1352,560 Q 1344,430 1330,310"
        stroke="#0d2006" strokeWidth="10" fill="none" strokeLinecap="round" strokeDasharray="35 22" />

      {/* Hoja 1: arriba-derecha */}
      <path d="M 1330,310 C 1352,278 1388,240 1422,182 C 1438,152 1454,110 1438,68
               C 1422,102 1404,145 1376,188 C 1355,222 1340,268 1330,305 Z"
        fill="url(#lf1)" opacity="0.95" />
      {/* Hoja 2: derecha */}
      <path d="M 1330,310 C 1378,302 1436,282 1486,252 C 1528,226 1570,190 1584,148
               C 1552,172 1510,202 1462,230 C 1418,252 1372,276 1332,306 Z"
        fill="url(#lf2)" opacity="0.9" />
      {/* Hoja 3: arriba-centro */}
      <path d="M 1330,310 C 1340,268 1350,212 1344,148 C 1338,94 1326,50 1310,14
               C 1304,56 1310,110 1314,168 C 1318,218 1322,270 1326,308 Z"
        fill="url(#lf1)" opacity="0.9" />
      {/* Hoja 4: arriba-izquierda */}
      <path d="M 1330,310 C 1292,274 1238,234 1178,202 C 1130,176 1072,160 1032,154
               C 1068,170 1120,192 1168,224 C 1220,258 1272,294 1322,308 Z"
        fill="url(#lf2)" opacity="0.88" />
      {/* Hoja 5: izquierda */}
      <path d="M 1330,310 C 1272,298 1202,276 1132,252 C 1072,232 1016,206 978,172
               C 1016,200 1072,230 1134,255 C 1204,282 1274,304 1324,312 Z"
        fill="url(#lf3)" opacity="0.82" />
      {/* Hoja 6: abajo-derecha */}
      <path d="M 1330,310 C 1368,332 1412,364 1448,406 C 1474,438 1490,476 1476,508
               C 1456,476 1430,444 1394,414 C 1368,390 1342,356 1328,320 Z"
        fill="url(#lf2)" opacity="0.72" />
      {/* Hoja pequeña extra */}
      <path d="M 1330,310 C 1342,282 1362,248 1392,224 C 1416,204 1444,192 1460,178
               C 1442,186 1418,198 1394,220 C 1364,246 1342,280 1328,308 Z"
        fill="url(#lf3)" opacity="0.7" />

      {/* ===== PALMERA FONDO IZQUIERDA ===== */}
      <path d="M 320,905 Q 328,760 334,620 Q 338,510 342,410"
        stroke="#112808" strokeWidth="16" fill="none" strokeLinecap="round" opacity="0.65" />
      <path d="M 342,410 C 308,386 256,354 196,318 C 256,350 308,382 340,406 Z"
        fill="url(#lf4)" opacity="0.55" />
      <path d="M 342,410 C 326,370 316,312 328,250 C 336,298 340,360 344,404 Z"
        fill="url(#lf4)" opacity="0.55" />
      <path d="M 342,410 C 374,376 424,338 488,300 C 426,336 376,372 344,406 Z"
        fill="url(#lf4)" opacity="0.55" />
      <path d="M 342,410 C 372,394 420,374 476,352 C 420,370 372,392 344,408 Z"
        fill="url(#lf4)" opacity="0.45" />
      <path d="M 342,410 C 318,430 286,456 254,488 C 280,460 314,436 340,418 Z"
        fill="url(#lf4)" opacity="0.4" />

      {/* ===== PALMERA FONDO DERECHA ===== */}
      <path d="M 1120,905 Q 1112,760 1106,620 Q 1102,510 1098,410"
        stroke="#112808" strokeWidth="16" fill="none" strokeLinecap="round" opacity="0.65" />
      <path d="M 1098,410 C 1132,386 1184,354 1244,318 C 1184,350 1132,382 1100,406 Z"
        fill="url(#lf4)" opacity="0.55" />
      <path d="M 1098,410 C 1114,370 1124,312 1112,250 C 1104,298 1100,360 1096,404 Z"
        fill="url(#lf4)" opacity="0.55" />
      <path d="M 1098,410 C 1066,376 1016,338 952,300 C 1014,336 1064,372 1096,406 Z"
        fill="url(#lf4)" opacity="0.55" />
      <path d="M 1098,410 C 1068,394 1020,374 964,352 C 1020,370 1068,392 1096,408 Z"
        fill="url(#lf4)" opacity="0.45" />
      <path d="M 1098,410 C 1122,430 1154,456 1186,488 C 1160,460 1126,436 1100,418 Z"
        fill="url(#lf4)" opacity="0.4" />

      {/* ===== HOJAS GRANDES EN ESQUINAS (primer plano) ===== */}
      {/* Esquina superior izquierda — hoja ancha tropical */}
      <path d="M -20,-20 C 80,40 140,120 100,220 C 60,160 20,80 -20,20 Z"
        fill="url(#lf1)" opacity="0.85" />
      <path d="M -20,-20 C 60,20 160,60 220,140 C 140,80 60,30 -20,0 Z"
        fill="url(#lf2)" opacity="0.8" />
      <path d="M -20,80 C 40,100 120,140 160,200 C 100,160 40,120 -20,100 Z"
        fill="url(#lf3)" opacity="0.75" />

      {/* Esquina superior derecha */}
      <path d="M 1460,-20 C 1360,40 1300,120 1340,220 C 1380,160 1420,80 1460,20 Z"
        fill="url(#lf1)" opacity="0.85" />
      <path d="M 1460,-20 C 1380,20 1280,60 1220,140 C 1300,80 1380,30 1460,0 Z"
        fill="url(#lf2)" opacity="0.8" />
      <path d="M 1460,80 C 1400,100 1320,140 1280,200 C 1340,160 1400,120 1460,100 Z"
        fill="url(#lf3)" opacity="0.75" />

      {/* Esquina inferior izquierda */}
      <path d="M -20,920 C 60,840 140,790 200,740 C 140,800 60,850 -20,900 Z"
        fill="url(#lf2)" opacity="0.7" />
      <path d="M -20,920 C 80,870 180,820 260,780 C 170,830 70,878 -20,910 Z"
        fill="url(#lf3)" opacity="0.65" />

      {/* Esquina inferior derecha */}
      <path d="M 1460,920 C 1380,840 1300,790 1240,740 C 1300,800 1380,850 1460,900 Z"
        fill="url(#lf2)" opacity="0.7" />
      <path d="M 1460,920 C 1360,870 1260,820 1180,780 C 1270,830 1370,878 1460,910 Z"
        fill="url(#lf3)" opacity="0.65" />

      {/* Oscurecer centro para legibilidad del contenido */}
      <rect width="1440" height="900" fill="url(#centerDark)" />
    </svg>
  )
}

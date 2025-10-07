// AQUÍ ESTÁN LOS DATOS POR DEFAULT DE LA APP, TAMBIÉN AQUÍ DEBERÍA REEMPLAZARSE POR LA CONEXIÓN A LA API

//LLAVE EN EL LOCALSTORAGE
const KEY = "kodigo_boards_v1";

//DATA POR DEFAULT
const defaultData = {
  boards: [
    { id: "b1", name: "Tablero 1" },
    { id: "b2", name: "Tablero 2" },
  ],
  activeBoardId: "b1",
  columns: {
    b1: [
      { id: "c1", name: "Tabla 1", color: "base.teal", cardIds: ["t1"] },
      { id: "c2", name: "Tabla 2", color: "base.blue", cardIds: ["t2"] },
      { id: "c3", name: "Tabla 3", color: "base.orange", cardIds: ["t3"] },
    ],
    b2: [],
  },
  cards: {
    t1: { id: "t1", title: "Ejemplo 1" },
    t2: { id: "t2", title: "Ejemplo 2" },
    t3: { id: "t3", title: "Ejemplo 3" },
  },
};

//CARGAR INFO
export function load() {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : defaultData;
}

//GUARDAR INFO
export function save(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

//CREA ID'S PARA LOS TABLEROS O COLUMNAS O TARJETAS
export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

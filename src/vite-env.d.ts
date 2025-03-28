/// <reference types="vite/client" />

declare module '*.yaml' {
    const data: any; // Puedes usar 'any' o definir un tipo más específico si conoces la estructura
    export default data;
  }
  
  // Opcional: si también usas la extensión .yml
  declare module '*.yml' {
    const data: any;
    export default data;
  }
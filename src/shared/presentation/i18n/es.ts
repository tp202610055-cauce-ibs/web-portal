// Single catalog of visible texts (es-PE, informal "tú"); components never hardcode copy.
export const es = {
  app: {
    name: 'Cauce',
    portal: 'Portal del nutricionista',
  },
  nav: {
    label: 'Navegación principal',
    patients: 'Pacientes',
  },
  login: {
    title: 'Ingresa al portal',
    pending: 'El inicio de sesión estará disponible en la próxima versión del portal.',
  },
  patients: {
    title: 'Pacientes',
  },
  notFound: {
    title: 'Página no encontrada',
    back: 'Volver al inicio',
  },
} as const;

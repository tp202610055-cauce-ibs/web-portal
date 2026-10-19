// Single catalog of visible texts (es-PE, informal "tú"); components never hardcode copy.
export const es = {
  app: {
    name: 'Cauce',
    portal: 'Portal del nutricionista',
  },
  generic: {
    error: 'Algo salió mal. Inténtalo de nuevo.',
    field: 'Revisa este campo',
    loading: 'Cargando…',
  },
  nav: {
    label: 'Navegación principal',
    patients: 'Panel de pacientes',
  },
  session: {
    signedInAs: 'Sesión de',
    logout: 'Cerrar sesión',
    unavailable: 'No pudimos conectar con el portal.',
    retry: 'Reintentar',
    idleClosed: 'Tu sesión se cerró por inactividad. Inicia sesión de nuevo.',
    expired: 'Tu sesión terminó. Inicia sesión de nuevo.',
  },
  login: {
    title: 'Ingresa al portal',
    email: 'Correo electrónico',
    password: 'Contraseña',
    submit: 'Ingresar',
    submitting: 'Ingresando…',
    rejected: 'No se pudo iniciar sesión. Revisa tus datos e inténtalo de nuevo.',
    lockedToday: (time: string) =>
      `Tu cuenta está bloqueada temporalmente. Inténtalo de nuevo después de las ${time}.`,
    lockedOnDate: (date: string, time: string) =>
      `Tu cuenta está bloqueada temporalmente. Inténtalo de nuevo después del ${date} a las ${time}.`,
    rateLimited: 'Hiciste demasiados intentos. Espera un momento e inténtalo de nuevo.',
  },
  idle: {
    title: '¿Sigues ahí?',
    body: (remaining: string) => `Por inactividad, tu sesión se cerrará en ${remaining}.`,
    announcement: (remaining: string) => `Tu sesión se cerrará en ${remaining}.`,
    stay: 'Seguir conectado',
    logout: 'Cerrar sesión',
  },
  patients: {
    title: 'Pacientes',
  },
  notFound: {
    title: 'Página no encontrada',
    back: 'Volver al inicio',
  },
} as const;

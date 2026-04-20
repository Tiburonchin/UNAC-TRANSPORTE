const getBaseUrl = () => {
    const { origin, pathname } = window.location;
    // Detecta si estamos en GitHub Pages (subcarpeta /UNAC-TRANSPORTE/)
    const isGitHubPages = pathname.toLowerCase().includes('/unac-transporte');
    const basePath = isGitHubPages ? '/UNAC-TRANSPORTE' : '';
    return `${origin}${basePath}`;
};

window.__SUPABASE_CONFIG__ = {
    url: 'https://brjujxeektcbgzodpaog.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyanVqeGVla3RjYmd6b2RwYW9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NjM0ODIsImV4cCI6MjA5MjAzOTQ4Mn0.rv5_ekCrKOWL5bI_nXrme5bk9m4yOA15YUnxpe5yOV0',
    redirectTo: `${getBaseUrl()}/index.html`,
    allowedEmailDomain: 'unac.edu.pe',
    profileTable: 'student_profiles',
    privateBucket: 'student-documents'
};

const getBaseUrl = () => {
    const { origin, pathname } = window.location;
    // Buscamos la posición de /UNAC-TRANSPORTE en el pathname para manejar subcarpetas (Local o GitHub)
    const folderName = '/UNAC-TRANSPORTE';
    const index = pathname.toUpperCase().indexOf(folderName);
    
    if (index !== -1) {
        // Capturamos desde el inicio hasta el final de la carpeta del proyecto
        return origin + pathname.substring(0, index + folderName.length);
    }
    return origin;
};

window.__SUPABASE_CONFIG__ = {
    url: 'https://brjujxeektcbgzodpaog.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyanVqeGVla3RjYmd6b2RwYW9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NjM0ODIsImV4cCI6MjA5MjAzOTQ4Mn0.rv5_ekCrKOWL5bI_nXrme5bk9m4yOA15YUnxpe5yOV0',
    redirectTo: `${getBaseUrl()}/index.html`,
    allowedEmailDomain: 'unac.edu.pe',
    profileTable: 'student_profiles',
    privateBucket: 'documents'
};

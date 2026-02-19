// Importa las herramientas de Firebase desde la nube
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, sendEmailVerification, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
// --- CONFIGURACIÓN DE FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyDBHlekQjssp0ZmFwmvIsHPjrxNf4Voy-k",
  authDomain: "academic-hiring-platform-ahp.firebaseapp.com",
  projectId: "academic-hiring-platform-ahp",
  storageBucket: "academic-hiring-platform-ahp.firebasestorage.app",
  messagingSenderId: "428143700637",
  appId: "1:428143700637:web:e93b450c745fa238250274",
  measurementId: "G-C9N0D84JZH"
};
// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Evita que usuarios no verificados mantengan acceso: escucha cambios de estado
onAuthStateChanged(auth, async (user) => {
    const loginScreen = document.getElementById('login-screen');
    const mainScreen = document.getElementById('main-screen');
    const errorMsg = document.getElementById('mensaje-error');

    if (user) {
        try {
            await user.reload();
        } catch (e) {
            console.error('Error al recargar usuario:', e);
        }

        if (!user.emailVerified) {
            // Forzar cierre y mostrar mensaje si no está verificado
            await signOut(auth);
            if (errorMsg) mostrarError(errorMsg, "Por favor verifica tu correo electrónico antes de iniciar sesión.");
            if (loginScreen) loginScreen.style.display = 'block';
            if (mainScreen) mainScreen.style.display = 'none';
        } else {
            if (loginScreen) loginScreen.style.display = 'none';
            if (mainScreen) mainScreen.style.display = 'block';
            const info = document.getElementById('mensaje-info');
            if (info) info.style.display = 'none';
        }
    } else {
        if (loginScreen) loginScreen.style.display = 'block';
        if (mainScreen) mainScreen.style.display = 'none';
    }
});

// --- FUNCIONES DEL SITIO ---
// Usa "window." para que el HTML pueda encontrar estas funciones
window.verificarAcceso = async function() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('mensaje-error');

    if (email === "") {
        mostrarError(errorMsg, "El campo de correo está vacío");
        return;
    } 
    
    if (!validarDominio(email)) {
        mostrarError(errorMsg, "Solo se permiten correos @tecmilenio.mx");
        return;
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        // Asegurarse de tener el estado más reciente del usuario
        if (user.reload) await user.reload();
        if (!user.emailVerified) {
            mostrarError(errorMsg, "Por favor verifica tu correo electrónico antes de iniciar sesión.");
            await signOut(auth);
            return;
        }
        // Login exitoso
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('main-screen').style.display = 'block';
    } catch (error) {
        console.error(error);
        mostrarError(errorMsg, "Correo o contraseña incorrectos");
    }
};

window.registrarUsuario = async function() {
    const nombre = document.getElementById('reg-nombre').value;
    const email = document.getElementById('reg-email').value.trim();
    const pass = document.getElementById('reg-password').value;
    const confirmPass = document.getElementById('reg-confirm-password').value;
    const errorMsg = document.getElementById('reg-mensaje-error');

    if (!validarDominio(email)) {
        mostrarError(errorMsg, "⚠️ Debes usar un correo institucional (@tecmilenio.mx)");
        return;
    }

    if (pass !== confirmPass) {
        mostrarError(errorMsg, "Las contraseñas no coinciden");
        return;
    }

    if (pass.length < 6) {
        mostrarError(errorMsg, "⚠️ La contraseña debe tener al menos 6 caracteres");
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        // Guardar el nombre del usuario en su perfil de Firebase
        await updateProfile(userCredential.user, { displayName: nombre });
        // Enviar correo de verificación y forzar verificación antes de acceso
        await sendEmailVerification(userCredential.user);
        // Cerrar sesión para evitar que el usuario quede autenticado inmediatamente
        await signOut(auth);
        const info = document.getElementById('mensaje-info');
        if (info) {
            info.textContent = 'Cuenta creada. Se ha enviado un correo de verificación. Confirma tu correo antes de iniciar sesión.';
            info.style.display = 'block';
        } else {
            alert('Cuenta creada. Se ha enviado un correo de verificación. Confirma tu correo antes de iniciar sesión.');
        }
        document.getElementById('register-screen').style.display = 'none';
        document.getElementById('login-screen').style.display = 'block';
    } catch (error) {
        console.error(error);
        if (error.code === 'auth/email-already-in-use') {
            mostrarError(errorMsg, "Este correo ya está registrado");
        } else {
            mostrarError(errorMsg, "⚠️ Error: " + error.message);
        }
    }
};

window.mostrarRegistro = function() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('register-screen').style.display = 'block';
};

window.mostrarLogin = function() {
    document.getElementById('register-screen').style.display = 'none';
    document.getElementById('login-screen').style.display = 'block';
};

window.cerrarSesion = async function() {
    await signOut(auth);
    document.getElementById('main-screen').style.display = 'none';
    document.getElementById('login-screen').style.display = 'block';
    // Limpiar campos
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    document.getElementById('mensaje-error').style.display = 'none';
};

// Funciones auxiliares
function validarDominio(email) {
    return email.toLowerCase().endsWith('@tecmilenio.mx');
}

function mostrarError(elemento, mensaje) {
    elemento.textContent = mensaje;
    elemento.style.display = 'block';
}

// Simula un método GET para obtener el nombre del usuario desde Firebase Auth
window.obtenerNombreGET = async function() {
    const user = auth.currentUser;
    if (!user) return null;
    return user.displayName || user.email || null;
};

// Usado por el botón "Ingresar al Menu Principal"
window.ingresarMenu = async function() {
    const nombre = await window.obtenerNombreGET();
    const main = document.getElementById('main-screen');
    const greeting = nombre ? `Bienvenido ${nombre} {GET}` : 'Bienvenido {GET}';

    // Reemplaza el contenido de la pantalla principal por el saludo
    main.innerHTML = '';
    const h1 = document.createElement('h1');
    h1.textContent = greeting;
    main.appendChild(h1);

    const p = document.createElement('p');
    p.textContent = 'Acceso restringido a usuarios ajenos a la comunidad de Tecmilenio';
    main.appendChild(p);

    const logoutBtn = document.createElement('button');
    logoutBtn.textContent = 'Cerrar Sesión';
    logoutBtn.onclick = cerrarSesion;
    main.appendChild(logoutBtn);
};

// Reenviar correo de verificación (usa las credenciales en los campos de login)
// (Se mantiene una sola implementación de `reenviarCorreoVerificacion` más abajo)

// Función reenviarCorreoVerificacion eliminada: flujo manejado por listener onAuthStateChanged
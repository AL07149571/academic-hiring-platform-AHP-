function verificarAcceso() {
    const email = document.getElementById('email').value;
    const errorMsg = document.getElementById('mensaje-error');
    
    if (email.toLowerCase().endsWith('@tecmilenio.mx')) {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('main-screen').style.display = 'block';
    } else {
        errorMsg.style.display = 'block';
    }
}

function registrarUsuario() {
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-password').value;
    const confirmPass = document.getElementById('reg-confirm-password').value;
    const errorMsg = document.getElementById('reg-mensaje-error');

    if (!email.toLowerCase().endsWith('@tecmilenio.mx')) {
        errorMsg.textContent = "⚠️ Debes usar un correo institucional (@tecmilenio.mx)";
        errorMsg.style.display = 'block';
        return;
    }

    if (pass !== confirmPass) {
        errorMsg.textContent = "⚠️ Las contraseñas no coinciden";
        errorMsg.style.display = 'block';
        return;
    }

    if (pass.length < 1) {
        errorMsg.textContent = "⚠️ Ingresa una contraseña";
        errorMsg.style.display = 'block';
        return;
    }

    // Registro exitoso simulado
    alert('¡Cuenta creada exitosamente! Bienvenido.');
    document.getElementById('register-screen').style.display = 'none';
    document.getElementById('main-screen').style.display = 'block';
}

function mostrarRegistro() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('register-screen').style.display = 'block';
}

function mostrarLogin() {
    document.getElementById('register-screen').style.display = 'none';
    document.getElementById('login-screen').style.display = 'block';
}

function cerrarSesion() {
    document.getElementById('main-screen').style.display = 'none';
    document.getElementById('login-screen').style.display = 'block';
    // Limpiar campos
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    document.getElementById('mensaje-error').style.display = 'none';
}
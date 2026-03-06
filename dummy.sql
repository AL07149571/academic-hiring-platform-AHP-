CREATE TABLE cliente (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE campus (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  FOREIGN KEY (cliente_id) REFERENCES cliente(id)
) ENGINE=InnoDB;

CREATE TABLE usuario_rh (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  campus_id INT NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  correo VARCHAR(190) NOT NULL,
  telefono VARCHAR(30),
  password_hash VARCHAR(255) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (correo),
  FOREIGN KEY (cliente_id) REFERENCES cliente(id),
  FOREIGN KEY (campus_id) REFERENCES campus(id)
) ENGINE=InnoDB;

CREATE TABLE candidato (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  correo VARCHAR(190) NOT NULL,
  telefono VARCHAR(30),
  area_especialidad VARCHAR(120),
  experiencia_anos INT NULL,
  photo_path VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (correo)
) ENGINE=InnoDB;

CREATE TABLE vacante (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  campus_id INT NOT NULL,
  created_by INT NOT NULL,
  titulo VARCHAR(150) NOT NULL,
  area VARCHAR(120),
  estatus ENUM('OPEN','CLOSED') NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES cliente(id),
  FOREIGN KEY (campus_id) REFERENCES campus(id),
  FOREIGN KEY (created_by) REFERENCES usuario_rh(id)
) ENGINE=InnoDB;

CREATE TABLE postulacion (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vacante_id INT NOT NULL,
  candidato_id INT NOT NULL,
  estatus ENUM('PENDIENTE','ACEPTADO','RECHAZADO') NOT NULL DEFAULT 'PENDIENTE',
  interview_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE (vacante_id, candidato_id),
  FOREIGN KEY (vacante_id) REFERENCES vacante(id),
  FOREIGN KEY (candidato_id) REFERENCES candidato(id),
  INDEX (estatus),
  INDEX (interview_at)
) ENGINE=InnoDB;
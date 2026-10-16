/* Casos de prueba ocultos de la demo. JSON puro envuelto en una asignación (file:// no deja hacer fetch).
   Las fechas de las sanciones son relativas a hoy: `diasEjecutoria` = hace cuántos días quedó en firme el acto. */
window.DEMO_CASOS = {
  "version": 1,
  "personas": [
    {
      "id": "limpia-1",
      "etiqueta": "Sin antecedentes · para sancionar",
      "tipoId": "Cédula de Ciudadanía (CC)",
      "numId": "1090000001",
      "nombres": "Valentina",
      "apellidos": "Cortés Ibarra",
      "fechaNac": "1996-03-22",
      "sexo": "Mujer",
      "depto": "Atlántico",
      "ciudad": "Barranquilla",
      "dir": "CL 84 # 51B - 20 AP 502",
      "telefono": "3001090001",
      "correo": "v.cortes@ejemplo.test",
      "sanciones": [],
      "borrador": {
        "diasHechos": 45,
        "competicion": "Liga",
        "local": "JUNIOR F.C.",
        "visitante": "MILLONARIOS F.C.",
        "ciudadHechos": "Barranquilla",
        "origen": [
          5
        ],
        "descripcion": "Ingresó bebidas alcohólicas en el estadio.",
        "meses": 6
      },
      "guion": {
        "radicado": "Expediente radicado por la Inspección de Barranquilla.",
        "devolucion": null,
        "validacion": "Cumple los requisitos formales; acto y ejecutoria completos."
      }
    },
    {
      "id": "limpia-2",
      "etiqueta": "Sin antecedentes · para sancionar",
      "tipoId": "Cédula de Ciudadanía (CC)",
      "numId": "1090000002",
      "nombres": "Mauricio",
      "apellidos": "Salgado Pineda",
      "fechaNac": "1988-11-05",
      "sexo": "Hombre",
      "depto": "Antioquia",
      "ciudad": "Medellín",
      "dir": "KR 70 # 44 - 31",
      "telefono": "3001090002",
      "correo": "",
      "sanciones": [],
      "borrador": {
        "diasHechos": 60,
        "competicion": "Liga",
        "local": "ATLÉTICO NACIONAL",
        "visitante": "DEPORTIVO CALI",
        "ciudadHechos": "Medellín",
        "origen": [
          2
        ],
        "descripcion": "Agredió a un integrante de la logística durante el ingreso.",
        "meses": 18
      },
      "guion": {
        "radicado": "Expediente radicado y recibido por el profesional.",
        "devolucion": null,
        "validacion": "Cumple los requisitos formales."
      }
    },
    {
      "id": "vigente",
      "oculta": true,
      "solicitud": {
        "origen": "Inspección municipal 3 de Cali",
        "tipo": "Inspección municipal",
        "diasHechos": 12,
        "evento": "América vs. Tolima",
        "estadio": "Estadio Pascual Guerrero",
        "autoridad": "Inspección municipal 3 de Cali",
        "conductas": [
          0
        ],
        "descripcion": "Intentó ingresar al escenario con un objeto cortopunzante en la Puerta 2."
      },
      "etiqueta": "Sanción vigente",
      "tipoId": "Cédula de Ciudadanía (CC)",
      "numId": "1090000003",
      "nombres": "Hernán Darío",
      "apellidos": "Ocampo Vélez",
      "fechaNac": "1985-07-17",
      "sexo": "Hombre",
      "depto": "Valle del Cauca",
      "ciudad": "Cali",
      "dir": "CL 5 # 38 - 12",
      "telefono": "3001090003",
      "correo": "h.ocampo@ejemplo.test",
      "sanciones": [
        {
          "diasEjecutoria": 120,
          "meses": 24,
          "estadoRegistro": "Validado",
          "origen": [
            0
          ],
          "competicion": "Liga",
          "local": "AMÉRICA DE CALI",
          "visitante": "DEPORTES TOLIMA",
          "ciudadHechos": "Cali",
          "descripcion": "Intentó ingresar al escenario con un objeto cortopunzante."
        }
      ],
      "guion": {
        "radicado": "Expediente radicado por la Inspección municipal 3 de Cali.",
        "devolucion": "Falta la constancia de ejecutoria con firma.",
        "validacion": "Subsanado: se adjuntó la constancia firmada; cumple los requisitos.",
        "previas": [
          {
            "diasEjecutoria": 1100,
            "meses": 12,
            "estadoRegistro": "Validado",
            "origen": [
              5
            ],
            "competicion": "Liga",
            "local": "AMÉRICA DE CALI",
            "visitante": "DEPORTIVO PASTO",
            "ciudadHechos": "Cali",
            "descripcion": "Ingresó bebidas alcohólicas en el estadio."
          }
        ]
      }
    },
    {
      "id": "por-vencer",
      "etiqueta": "Sanción por vencer",
      "tipoId": "Cédula de Ciudadanía (CC)",
      "numId": "1090000004",
      "nombres": "Liliana Patricia",
      "apellidos": "Arango Ruiz",
      "fechaNac": "1992-01-30",
      "sexo": "Mujer",
      "depto": "Santander",
      "ciudad": "Bucaramanga",
      "dir": "KR 27 # 36 - 40",
      "telefono": "3001090004",
      "correo": "",
      "sanciones": [
        {
          "diasEjecutoria": 340,
          "meses": 12,
          "estadoRegistro": "Validado",
          "origen": [
            5
          ],
          "competicion": "Liga",
          "local": "ATLÉTICO BUCARAMANGA",
          "visitante": "ENVIGADO F.C.",
          "ciudadHechos": "Bucaramanga",
          "descripcion": "Ingresó bebidas alcohólicas en el estadio."
        }
      ],
      "guion": {
        "radicado": "Expediente radicado por la Inspección de Bucaramanga.",
        "devolucion": null,
        "validacion": "Cumple los requisitos formales.",
        "previas": [
          {
            "diasEjecutoria": 1500,
            "meses": 6,
            "estadoRegistro": "Validado",
            "origen": [
              7
            ],
            "competicion": "Liga",
            "local": "ATLÉTICO BUCARAMANGA",
            "visitante": "DEPORTIVO PEREIRA",
            "ciudadHechos": "Bucaramanga",
            "descripcion": "Agresión verbal contra el cuerpo arbitral."
          }
        ]
      }
    },
    {
      "id": "cumplida",
      "etiqueta": "Sanción cumplida (antecedente)",
      "tipoId": "Cédula de Ciudadanía (CC)",
      "numId": "1090000005",
      "nombres": "Esteban",
      "apellidos": "Carvajal Mora",
      "fechaNac": "1990-09-09",
      "sexo": "Hombre",
      "depto": "Bolívar",
      "ciudad": "Cartagena de Indias",
      "dir": "CL 30 # 17 - 08",
      "telefono": "3001090005",
      "correo": "",
      "sanciones": [
        {
          "diasEjecutoria": 700,
          "meses": 12,
          "estadoRegistro": "Validado",
          "origen": [
            3
          ],
          "competicion": "Copa",
          "local": "REAL CARTAGENA",
          "visitante": "DEPORTIVO PASTO",
          "ciudadHechos": "Cartagena de Indias",
          "descripcion": "Invadió el terreno de juego al finalizar el partido."
        }
      ],
      "guion": {
        "radicado": "Expediente radicado por la Inspección de Cartagena.",
        "devolucion": "Falta el acto administrativo completo.",
        "validacion": "Subsanado: se adjuntó la resolución completa.",
        "previas": [
          {
            "diasEjecutoria": 1600,
            "meses": 6,
            "estadoRegistro": "Validado",
            "origen": [
              7
            ],
            "competicion": "Liga",
            "local": "REAL CARTAGENA",
            "visitante": "JUNIOR F.C.",
            "ciudadHechos": "Cartagena de Indias",
            "descripcion": "Agresión verbal reiterada contra la logística."
          }
        ]
      }
    },
    {
      "id": "en-tramite",
      "oculta": true,
      "etiqueta": "Registro recibido (aún no bloquea)",
      "tipoId": "Cédula de Ciudadanía (CC)",
      "numId": "1090000006",
      "nombres": "Camila Andrea",
      "apellidos": "Ruiz Soto",
      "fechaNac": "1999-04-12",
      "sexo": "Mujer",
      "depto": "Risaralda",
      "ciudad": "Pereira",
      "dir": "KR 7 # 19 - 24",
      "telefono": "3001090006",
      "correo": "c.ruiz@ejemplo.test",
      "sanciones": [
        {
          "diasEjecutoria": 10,
          "meses": 18,
          "estadoRegistro": "Recibido",
          "origen": [
            7
          ],
          "competicion": "Liga Femenina",
          "local": "DEPORTIVO PEREIRA",
          "visitante": "REAL CARTAGENA",
          "ciudadHechos": "Pereira",
          "descripcion": "Agresión verbal reiterada contra el cuerpo arbitral."
        }
      ],
      "guion": {
        "radicado": "Expediente radicado en el Ministerio; pendiente de revisión.",
        "devolucion": null,
        "validacion": "Cumple los requisitos formales."
      }
    },
    {
      "id": "menor",
      "etiqueta": "Menor de edad con representante",
      "tipoId": "Tarjeta de Identidad (TI)",
      "numId": "1090000007",
      "nombres": "Thiago Nicolás",
      "apellidos": "Peña Duarte",
      "fechaNac": "2010-05-12",
      "sexo": "Hombre",
      "depto": "Cundinamarca",
      "ciudad": "Bogotá D.C.",
      "dir": "KR 15 # 85 - 20",
      "telefono": "3001090007",
      "correo": "",
      "rep": {
        "tipoId": "Cédula de Ciudadanía (CC)",
        "numId": "1090000107",
        "nombres": "Marta Lucía",
        "apellidos": "Duarte Gil",
        "fechaNac": "1981-02-14",
        "sexo": "Mujer",
        "depto": "Cundinamarca",
        "ciudad": "Bogotá D.C.",
        "dir": "KR 15 # 85 - 20",
        "telefono": "3001090107",
        "correo": ""
      },
      "sanciones": [
        {
          "diasEjecutoria": 90,
          "meses": 12,
          "estadoRegistro": "Validado",
          "origen": [
            3
          ],
          "competicion": "Liga",
          "local": "MILLONARIOS F.C.",
          "visitante": "INDEPENDIENTE SANTA FE",
          "ciudadHechos": "Bogotá D.C.",
          "descripcion": "Invadió el terreno de juego al finalizar el partido."
        }
      ],
      "guion": {
        "radicado": "Expediente radicado; el infractor es menor de edad.",
        "devolucion": null,
        "validacion": "Menor de edad: representante legal verificado."
      }
    },
    {
      "id": "reincidente",
      "oculta": true,
      "solicitud": {
        "origen": "Atlético Nacional",
        "tipo": "Club de fútbol",
        "diasHechos": 9,
        "evento": "Nacional vs. Medellín",
        "estadio": "Estadio Atanasio Girardot",
        "autoridad": "Inspección municipal 14 de Medellín",
        "conductas": [
          6
        ],
        "descripcion": "Agredió a otro aficionado en la tribuna Oriental al terminar el partido."
      },
      "etiqueta": "Reincidente (una cumplida y una vigente)",
      "tipoId": "Cédula de Ciudadanía (CC)",
      "numId": "1090000008",
      "nombres": "Brayan Stiven",
      "apellidos": "Gallego Mora",
      "fechaNac": "1994-12-01",
      "sexo": "Hombre",
      "depto": "Antioquia",
      "ciudad": "Medellín",
      "dir": "CL 10 # 43 - 55",
      "telefono": "3001090008",
      "correo": "",
      "sanciones": [
        {
          "diasEjecutoria": 900,
          "meses": 12,
          "estadoRegistro": "Validado",
          "origen": [
            5
          ],
          "competicion": "Liga",
          "local": "ATLÉTICO NACIONAL",
          "visitante": "ENVIGADO F.C.",
          "ciudadHechos": "Medellín",
          "descripcion": "Ingresó bebidas alcohólicas en el estadio."
        },
        {
          "diasEjecutoria": 60,
          "meses": 36,
          "estadoRegistro": "Validado",
          "origen": [
            6
          ],
          "competicion": "Liga",
          "local": "ATLÉTICO NACIONAL",
          "visitante": "DEPORTIVO CALI",
          "ciudadHechos": "Medellín",
          "descripcion": "Agresión física a otro asistente en la tribuna."
        }
      ],
      "guion": {
        "radicado": "Expediente radicado por la Inspección municipal 14 de Medellín.",
        "devolucion": null,
        "validacion": "Cumple los requisitos formales; se anota la reincidencia."
      }
    },
    {
      "id": "limpia-3",
      "etiqueta": "Sin antecedentes · para sancionar",
      "tipoId": "Cédula de Ciudadanía (CC)",
      "numId": "1090000009",
      "nombres": "Andrea Carolina",
      "apellidos": "Bustos Lemus",
      "fechaNac": "1993-08-26",
      "sexo": "Mujer",
      "depto": "Cundinamarca",
      "ciudad": "Bogotá D.C.",
      "dir": "AC 26 # 59 - 51 ED 2",
      "telefono": "3001090009",
      "correo": "a.bustos@ejemplo.test",
      "sanciones": [],
      "borrador": {
        "diasHechos": 50,
        "competicion": "Liga",
        "local": "MILLONARIOS F.C.",
        "visitante": "INDEPENDIENTE SANTA FE",
        "ciudadHechos": "Bogotá D.C.",
        "origen": [
          1
        ],
        "descripcion": "Poseía sustancias estupefacientes al ingresar.",
        "meses": 20
      },
      "guion": {
        "radicado": "Expediente radicado desde la Inspección de Bogotá.",
        "devolucion": "Falta la constancia de ejecutoria con firma.",
        "validacion": "Subsanado: se adjuntó la constancia firmada; cumple los requisitos."
      }
    },
    {
      "id": "extranjero",
      "oculta": true,
      "etiqueta": "Extranjero con CE · sanción vigente",
      "tipoId": "Cédula de Extranjería (CE)",
      "numId": "1090000010",
      "nombres": "Luca",
      "apellidos": "Moretti Ferrer",
      "fechaNac": "1990-06-03",
      "sexo": "Hombre",
      "depto": "Cundinamarca",
      "ciudad": "Bogotá D.C.",
      "dir": "KR 13 # 93 - 40",
      "telefono": "3001090010",
      "correo": "",
      "sanciones": [
        {
          "diasEjecutoria": 150,
          "meses": 20,
          "estadoRegistro": "Validado",
          "origen": [
            1
          ],
          "competicion": "Liga",
          "local": "MILLONARIOS F.C.",
          "visitante": "INDEPENDIENTE SANTA FE",
          "ciudadHechos": "Bogotá D.C.",
          "descripcion": "Poseía sustancias estupefacientes al ingresar."
        }
      ],
      "guion": {
        "radicado": "Expediente radicado por la Inspección de Bogotá.",
        "devolucion": "El documento de extranjería adjunto está ilegible.",
        "validacion": "Subsanado: se adjuntó copia legible de la cédula de extranjería."
      }
    }
  ],
  "libres": [
    {
      "id": "libre-1",
      "tipoId": "Cédula de Ciudadanía (CC)",
      "numId": "1095000001",
      "nombres": "Juliana Marcela",
      "apellidos": "Osorio Cadavid",
      "fechaNac": "1991-02-18",
      "sexo": "Mujer",
      "depto": "Antioquia",
      "ciudad": "Medellín",
      "dir": "CL 50 # 45 - 12",
      "telefono": "3001095001",
      "correo": "",
      "guion": {
        "radicado": "Expediente radicado y recibido.",
        "devolucion": null,
        "validacion": "Cumple los requisitos formales."
      }
    },
    {
      "id": "libre-2",
      "tipoId": "Cédula de Ciudadanía (CC)",
      "numId": "1095000002",
      "nombres": "Santiago José",
      "apellidos": "Barrios Pacheco",
      "fechaNac": "1987-10-09",
      "sexo": "Hombre",
      "depto": "Atlántico",
      "ciudad": "Barranquilla",
      "dir": "KR 53 # 70 - 33",
      "telefono": "3001095002",
      "correo": "",
      "guion": {
        "radicado": "Expediente radicado por la Inspección municipal.",
        "devolucion": "Falta la constancia de ejecutoria con firma.",
        "validacion": "Subsanado: se adjuntó la constancia firmada."
      }
    },
    {
      "id": "libre-3",
      "tipoId": "Cédula de Ciudadanía (CC)",
      "numId": "1095000003",
      "nombres": "Natalia Isabel",
      "apellidos": "Quintero Ariza",
      "fechaNac": "1995-06-21",
      "sexo": "Mujer",
      "depto": "Bolívar",
      "ciudad": "Cartagena de Indias",
      "dir": "CL 31 # 8 - 45",
      "telefono": "3001095003",
      "correo": "",
      "guion": {
        "radicado": "Expediente radicado y recibido por el profesional.",
        "devolucion": null,
        "validacion": "Cumple los requisitos formales."
      }
    },
    {
      "id": "libre-4",
      "tipoId": "Cédula de Ciudadanía (CC)",
      "numId": "1095000004",
      "nombres": "Felipe Andrés",
      "apellidos": "Londoño Cruz",
      "fechaNac": "1993-12-02",
      "sexo": "Hombre",
      "depto": "Valle del Cauca",
      "ciudad": "Cali",
      "dir": "AV 6 # 25 - 18",
      "telefono": "3001095004",
      "correo": "",
      "guion": {
        "radicado": "Expediente radicado desde la Inspección de Cali.",
        "devolucion": null,
        "validacion": "Cumple los requisitos formales; acto completo."
      }
    },
    {
      "id": "libre-5",
      "tipoId": "Cédula de Ciudadanía (CC)",
      "numId": "1095000005",
      "nombres": "Daniela Sofía",
      "apellidos": "Rincón Mejía",
      "fechaNac": "1998-03-14",
      "sexo": "Mujer",
      "depto": "Cundinamarca",
      "ciudad": "Bogotá D.C.",
      "dir": "KR 7 # 72 - 41",
      "telefono": "3001095005",
      "correo": "",
      "guion": {
        "radicado": "Expediente radicado y recibido.",
        "devolucion": "Falta el acto administrativo completo.",
        "validacion": "Subsanado: se adjuntó la resolución completa."
      }
    },
    {
      "id": "libre-6",
      "tipoId": "Cédula de Ciudadanía (CC)",
      "numId": "1095000006",
      "nombres": "Camilo Ernesto",
      "apellidos": "Vargas Tello",
      "fechaNac": "1984-08-27",
      "sexo": "Hombre",
      "depto": "Santander",
      "ciudad": "Bucaramanga",
      "dir": "CL 42 # 31 - 09",
      "telefono": "3001095006",
      "correo": "",
      "guion": {
        "radicado": "Expediente radicado por la Inspección de Bucaramanga.",
        "devolucion": null,
        "validacion": "Cumple los requisitos formales."
      }
    },
    {
      "id": "libre-7",
      "tipoId": "Cédula de Ciudadanía (CC)",
      "numId": "1095000007",
      "nombres": "Paola Andrea",
      "apellidos": "Montoya Salazar",
      "fechaNac": "1990-11-11",
      "sexo": "Mujer",
      "depto": "Risaralda",
      "ciudad": "Pereira",
      "dir": "KR 8 # 21 - 56",
      "telefono": "3001095007",
      "correo": "",
      "guion": {
        "radicado": "Expediente radicado y recibido.",
        "devolucion": null,
        "validacion": "Cumple los requisitos formales."
      }
    },
    {
      "id": "libre-8",
      "tipoId": "Cédula de Ciudadanía (CC)",
      "numId": "1095000008",
      "nombres": "Iván Darío",
      "apellidos": "Cuesta Palacios",
      "fechaNac": "1982-05-05",
      "sexo": "Hombre",
      "depto": "Antioquia",
      "ciudad": "Medellín",
      "dir": "CL 33 # 74 - 20",
      "telefono": "3001095008",
      "correo": "",
      "guion": {
        "radicado": "Expediente radicado por la Inspección de Medellín.",
        "devolucion": "El número de la resolución no coincide con el acto.",
        "validacion": "Subsanado: se corrigió el número de la resolución."
      }
    },
    {
      "id": "libre-9",
      "tipoId": "Cédula de Ciudadanía (CC)",
      "numId": "1095000009",
      "nombres": "Karen Liseth",
      "apellidos": "Navarro Pérez",
      "fechaNac": "1997-09-30",
      "sexo": "Mujer",
      "depto": "Magdalena",
      "ciudad": "Santa Marta",
      "dir": "KR 5 # 19 - 27",
      "telefono": "3001095009",
      "correo": "",
      "guion": {
        "radicado": "Expediente radicado por la Inspección de Santa Marta.",
        "devolucion": null,
        "validacion": "Cumple los requisitos formales."
      }
    },
    {
      "id": "libre-10",
      "tipoId": "Cédula de Ciudadanía (CC)",
      "numId": "1095000010",
      "nombres": "Ricardo Alonso",
      "apellidos": "Mendoza Ibáñez",
      "fechaNac": "1989-01-23",
      "sexo": "Hombre",
      "depto": "Norte de Santander",
      "ciudad": "Cúcuta",
      "dir": "AV 0 # 11 - 60",
      "telefono": "3001095010",
      "correo": "",
      "guion": {
        "radicado": "Expediente radicado por la Inspección de Cúcuta.",
        "devolucion": null,
        "validacion": "Cumple los requisitos formales."
      }
    }
  ]
};

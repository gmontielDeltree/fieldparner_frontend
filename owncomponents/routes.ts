import "./proveedores/proveedores-lista";
import "./proveedores/proveedores-editor";
import "./proveedores/proveedores-detalles";
import "./ingenieros/ingenieros-listado";
import "./ingenieros/ingenieros-editor";
import "./ingenieros/ingenieros-detalles";
import "./settings/settings";
import "./analisis-suelo/analisis-suelo-editor";
import "./analisis-suelo/analisis-suelo-import-export";
import "./vehiculos/vehiculos-detalles";
import "./vehiculos/vehiculos-lista";
import "./null-component";
// import("./ndvi-offcanvas/ndvi-offcanvas");
import("./campo-offcanvas/campo-offcanvas");
// import("./lote-offcanvas/lote-offcanvas-side");
// import("./lote-offcanvas/upsert-ejecucion/upsert-ejecucion");
// import("./lote-offcanvas/upsert-aplicacion/upsert-aplicacion");
import("./lista-de-campos/lista-de-campos");
import("./john-deere/john-deere-integracion")
import("./integraciones/integraciones")

export const routes = [
  { path: "/", component: "null-component" },
  { path: "/gf", redirect: "/" },
  { path: "/integraciones", component:"menu-integraciones"},
  { path: "/integraciones/john-deere", component:"john-deere-integracion"},
  { path: "/campos", component: "lista-de-campos" },
  {
    path: "/indices/:uuid",
    action: async () => {
      await import("./ndvi-offcanvas/ndvi-offcanvas");
    },
    component: "ndvi-offcanvas",
  },
  { path: "/settings", component: "settings-modal" },
  {
    path: "/campo/:uuid_campo/lote/:uuid_lote/siembra/add",
    action: async () => {
      await import("./lote-offcanvas/lote-offcanvas-side");
    },
    component: "lote-offcanvas-side",
  },
  {
    path: "/campo/:uuid_campo/lote/:uuid_lote/siembra/edit",
    action: async () => {
      await import("./lote-offcanvas/lote-offcanvas-side");
    },
    component: "lote-offcanvas-side",
  },
  {
    path: "/campo/:uuid_campo/lote/:uuid_lote",
    action: async () => {
      await import("./lote-offcanvas/lote-offcanvas-side");
    },
    component: "lote-offcanvas-side",
  },
  {
    path: "/campo/:uuid_campo/lote/:uuid_lote/actividad/:uuid_actividad/repetir",
    component: "repetir-aplicacion",
  },
  {
    path: "/campo/:uuid_campo/lote/:uuid_lote/actividad/nueva/:tipo",
    action: async () => {
      await import("./lote-offcanvas/upsert-aplicacion/upsert-aplicacion");
    },
    component: "upsert-aplicacion",
  },
  {
    path: "/campo/:uuid_campo/lote/:uuid_lote/actividad/editar/:uuid",
    action: async () => {
      await import("./lote-offcanvas/upsert-aplicacion/upsert-aplicacion");
    },
    component: "upsert-aplicacion",
  },
  {
    path: "/campo/:uuid_campo/lote/:uuid_lote/ejecucion/:uuid/nueva",
    action: async () => {
      await import("./lote-offcanvas/upsert-ejecucion/upsert-ejecucion");
    },
    component: "upsert-ejecucion",
  },
  {
    path: "/campo/:uuid_campo/lote/:uuid_lote/ejecucion/:uuid/editar",
    action: async () => {
      await import("./lote-offcanvas/upsert-ejecucion/upsert-ejecucion");
    },
    component: "upsert-ejecucion",
  },
  { path: "/campo/add", component: "nuevo-campo" },
  { path: "/campo/:uuid", component: "campo-offcanvas" },
  { path: "/contratistas", component: "contratistas-lista" },
  { path: "/contratistas/add", component: "contratistas-crud" },
  {
    path: "/depositos",
    action: async () => {
      await import("./depositos/depositos-lista/depositos-listado");
    },
    component: "depositos-listado",
  },

  {
    path: "/depositos/add",
    action: async () => {
      await import("./depositos/depositos-lista/deposito-nuevo");
    },
    component: "depositos-upsert",
  },
  {
    path: "/deposito/:uuid",
    action: async () => {
      await import("./depositos/deposito-detalles/deposito-detalles");
    },
    children: [
      {
        path: "/",
        component: "deposito-detalles",
      },
      {
        path: "/transfer/add/:direccion",
        action: async () => {
          await import(
            "./depositos/deposito-transferencias/deposito-nuevo-transferencias"
          );
        },
        component: "deposito-nuevo-transferencias",
      },
    ],
  },
  {
    path: "/proveedores",
    component: "proveedores-lista",
    children: [
      {
        path: "/add",
        component: "proveedores-editor",
      },
      {
        path: "/:uuid/edit",
        component: "proveedores-editor",
      },
    ],
  },
  {
    path: "/proveedores/:uuid",
    component: "proveedores-detalles",
  },
  {
    // Edit transfer
    path: "/transfer/:uuid/edit",
    component: "deposito-nuevo-transferencias",
  },
  {
    path: "/insumos",
    action: async () => {
      await import("./insumos/insumos-lista");
    },
    component: "insumos-lista",
  },
  { path: "/rights/:uuid_workspace", component: "workspace-rights" },
  { path: "/invite/:base64_invitation", component: "link-invitacion" },
  {
    path: "/device/:uuid/dashboard/:date",
    component: "device-route-handler",
  },
  {
    path: "/personal",
    component: "ingenieros-listado",
    children: [
      { path: "/add", component: "ingenieros-editor" },
      { path: "/:uuid/edit", component: "ingenieros-editor" },
    ],
  },
  { path: "/personal/:uuid", component: "ingenieros-detalles" },
  { path: "/ejecucion", component: "null" },
  {
    path: "/analisissuelo/add",
    component: "analisis-suelo-editor",
    children: [
      {
        path: "/importar",
        component: "analisis-suelo-import-export",
      },
    ],
  },
  {
    path: "/analisissuelo/:uuid/edit",
    component: "analisis-suelo-editor",
    children: [
      {
        path: "/importar",
        component: "analisis-suelo-import-export",
      },
    ],
  },
  {
    path: "/equipos",
    children: [
      { path: "/", component: "vehiculos-lista" },
      { path: "/:uuid/edit", component: "vehiculos-detalles" },
      { path: "/add", component: "vehiculos-detalles" },
      { path: "/:uuid", component: "vehiculos-detalles" },
    ],
  },
  {
    path: "/prices",
    children: [
      {
        path: "/",
        action: async () => {
          await import("./analisis-precios/analisis-precios");
        },
        component: "analisis-precios",
      },
    ],
  },
  {
    path: "/campo/:uuid_campo/lote/:uuid_lote/nota",
    action: async () => {
      await import("./notas-offcanvas/notas-offcanvas");
    },
    children: [
      {
        path: "/:uuid/edit",
        action: async () => {
          await import("./notas-offcanvas/notas-offcanvas");
        },
        component: "notas-oc",
      },
      {
        path: "/add",
        component: "notas-oc",
        action: async () => {
          await import("./notas-offcanvas/notas-offcanvas");
        },
      },
    ],
  },
];

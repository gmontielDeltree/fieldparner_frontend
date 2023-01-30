import "./proveedores/proveedores-lista";
import "./proveedores/proveedores-editor";
import "./proveedores/proveedores-detalles";

export const routes = [
  { path: "/", component: "null-component" },
  { path: "/gf", redirect: "/" },
  { path: "/campos", component: "lista-de-campos" },
  { path: "/indices/:uuid", component: "ndvi-offcanvas" },
  { path: "/cultivos", component: "color-cultivo" },
  {
    path: "/campo/:uuid_campo/lote/:uuid_lote/siembra/add",
    component: "lote-offcanvas-side",
  },
  {
    path: "/campo/:uuid_campo/lote/:uuid_lote/siembra/edit",
    component: "lote-offcanvas-side",
  },
  {
    path: "/campo/:uuid_campo/lote/:uuid_lote",
    component: "lote-offcanvas-side",
  },
  {
    path: "/campo/:uuid_campo/lote/:uuid_lote/actividad/:uuid_actividad/repetir",
    component: "repetir-aplicacion",
  },
  {
    path: "/campo/:uuid_campo/lote/:uuid_lote/actividad/nueva/:tipo",
    component: "upsert-aplicacion",
  },
  {
    path: "/campo/:uuid_campo/lote/:uuid_lote/actividad/editar/:uuid",
    component: "upsert-aplicacion",
  },
  {
    path: "/campo/:uuid_campo/lote/:uuid_lote/ejecucion/:uuid/nueva",
    component: "upsert-ejecucion",
  },
  {
    path: "/campo/:uuid_campo/lote/:uuid_lote/ejecucion/:uuid/editar",
    component: "upsert-ejecucion",
  },
  { path: "/campo/add", component: "nuevo-campo" },
  { path: "/campo/:uuid", component: "campo-offcanvas" },
  { path: "/contratistas", component: "contratistas-lista" },
  { path: "/contratistas/add", component: "contratistas-crud" },
  { path: "/depositos", component: "depositos-listado" },
  { path: "/depositos/add", component: "depositos-upsert" },
  {
    path: "/deposito/:uuid",

    children: [
      {
        path: "/",
        component: "deposito-detalles",
      },
      {
        path: "/transfer/add/:direccion",
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
  { // Edit transfer
    path : "/transfer/:uuid/edit",
    component: "deposito-nuevo-transferencias"
  },
  { path: "/insumos", component: "insumos-lista" },
  { path: "/rights/:uuid_workspace", component: "workspace-rights" },
  { path: "/invite/:base64_invitation", component: "link-invitacion" },
  {
    path: "/device/:uuid/dashboard/:date",
    component: "device-route-handler",
  },
  { path: "/ejecucion", component: "null" },
];

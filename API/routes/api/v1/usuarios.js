const router = require("express").Router();
const auth = require("../../auth");
const UsuarioController = require("../../../controllers/UsuarioController.js");
const usuario = require("../../../models/usuario");

const usuarioController = new UsuarioController();

router.get("/", auth.require, usuarioController.index);
router.get("/:id", auth.require, usuarioController.show);

router.post("/login", usuarioController.login);
router.post("/register", usuarioController.store);
router.put("/", auth.require, usuarioController.update);
router.delete("/", auth.require, usuarioController.remove);

router.get("/recuperar-senha", usuarioController.showRecovery);
router.post("/recuperar-senha", usuarioController.createRecovery);
router.get("/senha-recuperada", usuarioController.showCompleteRecovery);
router.post("/senha-recuperada", usuarioController.completeRecovery);


module.exports = router;

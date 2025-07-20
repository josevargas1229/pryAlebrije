const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productController');
const { authenticateToken, authorize, ROLES } = require('../middlewares/auth');
const imageUpload = require('../config/multerImageConfig'); // Middleware para imágenes

// Middleware global para limitar el tamaño del cuerpo de las solicitudes (2 MB para JSON/formularios, no afecta multipart)
router.use(express.json({ limit: '2mb' }));
router.use(express.urlencoded({ limit: '2mb', extended: true }));

// Rutas
router.post(
    '/',
    authenticateToken,
    authorize(ROLES.ADMINISTRADOR),
    imageUpload,
    productoController.createProducto
);

router.get('/', productoController.getAllProductos);
router.get('/filters', productoController.getAllFilters);
router.get('recomended', authenticateToken, productoController.getRecomendacionesPorUsuario);
router.get('/low-stock', authenticateToken, productoController.getLowStockProducts);
router.get(
    '/eliminados',
    authenticateToken,
    authorize(ROLES.ADMINISTRADOR),
    productoController.getDeletedProductos
);
router.get('/:id', productoController.getProductoById);

router.put(
    '/:id',
    authenticateToken,
    authorize(ROLES.ADMINISTRADOR),
    imageUpload,
    productoController.updateProducto
);

router.patch(
    '/:id/restore',
    authenticateToken,
    authorize(ROLES.ADMINISTRADOR),
    productoController.restoreProducto
);

router.delete(
    '/:id',
    authenticateToken,
    authorize(ROLES.ADMINISTRADOR),
    productoController.deleteProducto
);

// Calificaciones
router.get('/:producto_id/calificaciones', productoController.obtenerCalificacionProducto);
router.post('/:producto_id/calificaciones', authenticateToken, productoController.agregarCalificacionProducto);
router.get('/:producto_id/calificaciones/:usuario_id', authenticateToken, productoController.verificarCalificacionUsuario);


module.exports = router;

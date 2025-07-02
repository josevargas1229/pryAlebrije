export interface ProductConfigOption {
    icon: string;
    title: string;
    description: string;
    route: string;
}

export const PRODUCTS_CONFIG_OPTIONS: ProductConfigOption[] = [
    {
        icon: 'inventory_2',
        title: 'Lista de productos',
        description: 'Administra los productos disponibles en el inventario.',
        route: '/admin/productos/list'
    },
    {
        icon: 'add_box',
        title: 'Agregar producto',
        description: 'Registra nuevos productos en el sistema de inventario.',
        route: '/admin/productos/add'
    },
    {
        icon: 'delete',
        title: 'Productos eliminados',
        description: 'Gestiona los productos eliminados del inventario.',
        route: '/admin/productos/eliminated'
    },
    {
        icon: 'category',
        title: 'Categorías de productos',
        description: 'Organiza los productos en diferentes categorías.',
        route: '/admin/productos/categorias'
    },
    {
        icon: 'warning',
        title: 'Bajo stock',
        description: 'Revisa los productos con bajo nivel de stock.',
        route: '/admin/productos/low-stock'
    },
    {
        icon: 'history',
        title: 'Historial',
        description: 'Revisa el historial de movimientos realizados.',
        route: '/admin/productos/history'
    },
    {
        icon: 'beach_access',
        title: 'Temporadas',
        description: 'Administra las temporadas asociadas a los productos.',
        route: '/admin/productos/temporadas'
    },
    {
        icon: 'type_specimen',
        title: 'Tipos de producto',
        description: 'Gestiona los tipos de productos en el catálogo.',
        route: '/admin/productos/tipos'
    },
    {
        icon: 'branding_watermark',
        title: 'Marcas',
        description: 'Organiza las marcas de los productos disponibles.',
        route: '/admin/productos/marcas'
    },
    {
        icon: 'straighten',
        title: 'Tallas',
        description: 'Administra las tallas para los productos.',
        route: '/admin/productos/tallas'
    },
    {
        icon: 'palette',
        title: 'Colores',
        description: 'Gestiona los colores disponibles en el catálogo.',
        route: '/admin/productos/colores'
    },
    {
        icon: 'local_offer',
        title: 'Promociones',
        description: 'Crea y gestiona promociones para los productos.',
        route: '/admin/productos/promociones'
    }
];

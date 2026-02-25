export type DishPhoto = {
    id: string
    name: string
    src: string
    category: 'main' | 'fit' | 'snack'
    keywords: string[]
}

export const dishPhotos: DishPhoto[] = [
    {
        id: 'strogonoff_frango',
        name: 'Strogonoff de Frango',
        src: '/dishes/strogonoff_frango.png',
        category: 'main',
        keywords: ['strogonoff', 'estrogonofe', 'frango', 'chicken', 'creme', 'arroz']
    },
    {
        id: 'arroz_feijao_bife',
        name: 'Prato Feito (Arroz, Feijão e Bife)',
        src: '/dishes/arroz_feijao_bife.png',
        category: 'main',
        keywords: ['prato feito', 'pf', 'arroz', 'feijão', 'feijao', 'bife', 'carne', 'tradicional']
    },
    {
        id: 'feijoada',
        name: 'Feijoada Completa',
        src: '/dishes/feijoada.png',
        category: 'main',
        keywords: ['feijoada', 'feijão preto', 'porco', 'tradicional', 'brasil']
    },
    {
        id: 'macarrao_bolonhesa',
        name: 'Macarrão à Bolonhesa',
        src: '/dishes/macarrao_bolonhesa.png',
        category: 'main',
        keywords: ['macarrão', 'macarrao', 'massa', 'bolonhesa', 'carne moída', 'molho', 'italiana']
    },
    {
        id: 'frango_grelhado',
        name: 'Frango Grelhado Fit',
        src: '/dishes/frango_grelhado.png',
        category: 'fit',
        keywords: ['frango', 'grelhado', 'fit', 'saudável', 'dieta', 'legumes']
    },
    {
        id: 'peixe_grelhado',
        name: 'Peixe Grelhado FIT',
        src: '/dishes/peixe_grelhado.png',
        category: 'fit',
        keywords: ['peixe', 'tilápia', 'grelhado', 'fit', 'saudável', 'dieta', 'psce']
    },
    {
        id: 'hamburguer',
        name: 'Hambúrguer Artesanal',
        src: '/dishes/hamburguer.png',
        category: 'snack',
        keywords: ['hambúrguer', 'hamburguer', 'burger', 'lanche', 'carne', 'sanduíche', 'fast food']
    },
    {
        id: 'salada_generica',
        name: 'Salada Fresca',
        src: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=400&fit=crop',
        category: 'fit',
        keywords: ['salada', 'folhas', 'vegetariano', 'vegano', 'saudável', 'fit']
    },
    {
        id: 'sopa_generica',
        name: 'Sopa Quente',
        src: 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=400&fit=crop',
        category: 'main',
        keywords: ['sopa', 'caldo', 'inverno', 'creme']
    }
]

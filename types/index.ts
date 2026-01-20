export type User = {
    id: string
    name: string
    cpf: string
    role: 'employee' | 'kitchen_staff'
}

export type MenuItem = {
    id: string
    name: string
    description: string
    type: 'main' | 'fit' | 'snack'
    photo_url: string | null
}

export type DailyMenu = {
    id: string
    date: string
    items?: MenuItem[]
}

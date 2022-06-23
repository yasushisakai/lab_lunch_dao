
export interface CaterInfo {
    name: string,
    menu: MenuItem[]
}

export interface MenuItem {
    name: string,
    footPrint: number,
    cost: number
}
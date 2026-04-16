type Tone = 'neutral' | 'accent' | 'warning' | 'success'

export const PAPEL_TONE: Record<'aluno' | 'admin' | 'superuser', Tone> = {
    aluno: 'neutral',
    admin: 'accent',
    superuser: 'warning',
}
export const PAPEL_LABEL = { aluno: 'Aluno', admin: 'Admin', superuser: 'Superuser' } as const

export const STATUS_CHAMADO_TONE: Record<'novo' | 'em_andamento' | 'resolvido', Tone> = {
    novo: 'accent',
    em_andamento: 'warning',
    resolvido: 'success',
}
export const STATUS_CHAMADO_LABEL = { novo: 'Novo', em_andamento: 'Em andamento', resolvido: 'Resolvido' } as const

export const TIPO_AULA_LABEL = { video: 'Vídeo', texto: 'Texto', quiz: 'Quiz' } as const

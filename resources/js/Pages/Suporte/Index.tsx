import { Head } from '@inertiajs/react'
import { useState } from 'react'
import GuestLayout from '@/layouts/GuestLayout'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface FormState {
    name: string
    email: string
    subject: string
    message: string
}

interface FormErrors {
    name?: string
    email?: string
    subject?: string
    message?: string
}

export default function SuporteIndex() {
    const [form, setForm] = useState<FormState>({ name: '', email: '', subject: '', message: '' })
    const [errors, setErrors] = useState<FormErrors>({})
    const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({})
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    function validate(field: keyof FormState, value: string): string | undefined {
        if (field === 'name' && value.trim().length < 2) return 'Nome deve ter pelo menos 2 caracteres.'
        if (field === 'email' && !EMAIL_REGEX.test(value)) return 'Informe um e-mail válido.'
        if (field === 'subject' && !value) return 'Selecione um assunto.'
        if (field === 'message' && value.trim().length < 10) return 'Mensagem deve ter pelo menos 10 caracteres.'
        return undefined
    }

    function handleBlur(field: keyof FormState) {
        setTouched((prev) => ({ ...prev, [field]: true }))
        setErrors((prev) => ({ ...prev, [field]: validate(field, form[field]) }))
    }

    function handleChange(field: keyof FormState, value: string) {
        setForm((prev) => ({ ...prev, [field]: value }))
        if (touched[field]) {
            setErrors((prev) => ({ ...prev, [field]: validate(field, value) }))
        }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        const newErrors: FormErrors = {}
        ;(Object.keys(form) as (keyof FormState)[]).forEach((field) => {
            const err = validate(field, form[field])
            if (err) newErrors[field] = err
        })
        setErrors(newErrors)
        setTouched({ name: true, email: true, subject: true, message: true })
        if (Object.keys(newErrors).length > 0) return

        setLoading(true)
        setTimeout(() => {
            setLoading(false)
            setSuccess(true)
        }, 1500)
    }

    const inputClass = (field: keyof FormState) =>
        `w-full bg-[#171b23] border rounded-lg px-3 py-2.5 text-sm text-[#f1f1f1] placeholder:text-[#555] focus:outline-none transition-colors ${
            touched[field] && errors[field]
                ? 'border-[#E50914]'
                : 'border-[#1e2430] focus:border-[#E50914]'
        }`

    return (
        <GuestLayout>
            <Head title="Suporte" />

            <div className="max-w-6xl mx-auto px-6 py-12">
                <header className="mb-12">
                    <h1 className="text-4xl font-bold text-[#f1f1f1] mb-2">Suporte</h1>
                    <p className="text-[#8a8a8a]">Estamos aqui para ajudar. Entre em contato pelo canal de sua preferência.</p>
                </header>


                {/* Formulário */}
                <section className="max-w-xl">
                    <h2 className="text-[#f1f1f1] text-2xl font-bold mb-6">Enviar mensagem</h2>

                    {success ? (
                        <div className="bg-green-950/40 border border-green-900/50 rounded-xl p-6 text-center">
                            <span className="text-3xl mb-3 block">✅</span>
                            <p className="text-green-400 font-medium">Mensagem enviada!</p>
                            <p className="text-[#8a8a8a] text-sm mt-1">Retornaremos em até 24 horas úteis.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} method="POST" noValidate className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm text-[#f1f1f1] mb-1.5">
                                    Nome <span className="text-[#E50914]">*</span>
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    onBlur={() => handleBlur('name')}
                                    placeholder="Seu nome"
                                    required
                                    minLength={2}
                                    className={inputClass('name')}
                                />
                                {touched.name && errors.name && (
                                    <span className="text-red-400 text-xs mt-1 block">{errors.name}</span>
                                )}
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm text-[#f1f1f1] mb-1.5">
                                    E-mail <span className="text-[#E50914]">*</span>
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    onBlur={() => handleBlur('email')}
                                    placeholder="seu@email.com"
                                    required
                                    className={inputClass('email')}
                                />
                                {touched.email && errors.email && (
                                    <span className="text-red-400 text-xs mt-1 block">{errors.email}</span>
                                )}
                            </div>

                            <div>
                                <label htmlFor="subject" className="block text-sm text-[#f1f1f1] mb-1.5">
                                    Assunto <span className="text-[#E50914]">*</span>
                                </label>
                                <select
                                    id="subject"
                                    value={form.subject}
                                    onChange={(e) => handleChange('subject', e.target.value)}
                                    onBlur={() => handleBlur('subject')}
                                    required
                                    className={inputClass('subject')}
                                >
                                    <option value="">Selecione um assunto</option>
                                    <option value="tecnico">Dúvida técnica</option>
                                    <option value="cobranca">Cobrança</option>
                                    <option value="sugestao">Sugestão</option>
                                    <option value="outro">Outro</option>
                                </select>
                                {touched.subject && errors.subject && (
                                    <span className="text-red-400 text-xs mt-1 block">{errors.subject}</span>
                                )}
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm text-[#f1f1f1] mb-1.5">
                                    Mensagem <span className="text-[#E50914]">*</span>
                                </label>
                                <textarea
                                    id="message"
                                    rows={5}
                                    value={form.message}
                                    onChange={(e) => handleChange('message', e.target.value)}
                                    onBlur={() => handleBlur('message')}
                                    placeholder="Descreva sua dúvida ou problema..."
                                    required
                                    minLength={10}
                                    className={inputClass('message')}
                                />
                                {touched.message && errors.message && (
                                    <span className="text-red-400 text-xs mt-1 block">{errors.message}</span>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#E50914] hover:bg-[#c20710] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-colors mt-2"
                            >
                                {loading ? 'Enviando...' : 'Enviar mensagem'}
                            </button>
                        </form>
                    )}
                </section>
            </div>
        </GuestLayout>
    )
}

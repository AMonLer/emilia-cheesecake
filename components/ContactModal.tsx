"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ContactModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [statusMessage, setStatusMessage] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name || !formData.email || !formData.message) {
            setStatusMessage("Bitte füllen Sie alle Pflichtfelder aus")
            return
        }

        if (!formData.email.includes('@')) {
            setStatusMessage("Bitte geben Sie eine gültige E-Mail-Adresse ein")
            return
        }

        setIsSubmitting(true)
        setStatusMessage("")

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                setStatusMessage("Vielen Dank! Ihre Nachricht wurde gesendet.")
                setTimeout(() => {
                    onClose()
                    setFormData({ name: "", email: "", subject: "", message: "" })
                    setStatusMessage("")
                }, 2000)
            } else {
                setStatusMessage("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.")
            }
        } catch (error) {
            console.error('Error sending contact form:', error)
            setStatusMessage("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-500 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-lg w-full p-8 relative shadow-2xl overflow-y-auto max-h-[95vh] my-auto animate-in zoom-in-95 duration-500">
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 text-gray-400 hover:text-gray-900 z-10 cursor-pointer transition-colors duration-300"
                    aria-label="Schließen"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="mb-6">
                    <h2 className="text-3xl font-black text-black mb-2 tracking-tight">Kontakt</h2>
                    <p className="text-sm text-gray-500">
                        Haben Sie Fragen? Wir helfen Ihnen gerne weiter.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                            Name *
                        </label>
                        <Input
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ihr Name"
                            className="w-full bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 h-12 rounded-lg focus:border-black focus:ring-black/10 transition-all"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            E-Mail *
                        </label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="ihre.email@beispiel.com"
                            className="w-full bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 h-12 rounded-lg focus:border-black focus:ring-black/10 transition-all"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                            Betreff
                        </label>
                        <Input
                            id="subject"
                            type="text"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            placeholder="Worum geht es?"
                            className="w-full bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 h-12 rounded-lg focus:border-black focus:ring-black/10 transition-all"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                            Nachricht *
                        </label>
                        <textarea
                            id="message"
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            placeholder="Ihre Nachricht an uns..."
                            rows={5}
                            className="w-full bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 p-3 rounded-lg focus:border-black focus:ring-2 focus:ring-black/10 transition-all resize-none"
                            disabled={isSubmitting}
                        />
                    </div>

                    {statusMessage && (
                        <p className={`text-sm text-center font-medium ${
                            statusMessage.includes('Vielen Dank') ? 'text-green-600' : 'text-red-600'
                        }`}>
                            {statusMessage}
                        </p>
                    )}

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-black text-white hover:bg-gray-900 font-medium py-6 text-sm rounded-lg tracking-widest uppercase transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Wird gesendet...' : 'Nachricht senden'}
                    </Button>
                </form>
            </div>
        </div>
    )
}

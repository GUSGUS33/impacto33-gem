"use client";
import JotFormEmbed from "@/components/JotFormEmbed";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export default function ContactPage() {
  // Using a placeholder form ID - User needs to provide the real one
  // Defaulting to a generic contact form ID or leaving empty for now
  const CONTACT_FORM_ID = "233402688849367"; // Example ID, replace with real one

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Contacto IMPACTO33",
            "description": "Página de contacto de IMPACTO33, especialistas en regalos personalizados.",
            "url": "https://impacto33.com/contacto",
            "mainEntity": {
              "@type": "LocalBusiness",
              "name": "IMPACTO33",
              "image": "https://impacto33.com/images/logo-impacto33.png",
              "telephone": "+34690906027",
              "email": "info@impacto33.com",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "ES"
              },
              "openingHoursSpecification": [
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                  "opens": "09:00",
                  "closes": "14:00"
                },
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                  "opens": "15:00",
                  "closes": "18:00"
                }
              ]
            }
          })}} />

      <div className="bg-slate-50 min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-slate-900 mb-4 font-['Montserrat'] uppercase">Contacta con nosotros</h1>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Estamos aquí para ayudarte a encontrar el regalo perfecto para tu empresa.
              Escríbenos y te responderemos en menos de 24 horas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {/* Contact Info */}
            <div className="md:col-span-1 space-y-6">
              <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-100 h-full">
                <h3 className="font-bold text-lg md:text-xl text-slate-900 mb-4 md:mb-6 font-['Montserrat']">Información de contacto</h3>
                
                <div className="space-y-4 md:space-y-6">
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600 mr-4">
                      <Phone size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Teléfono</h4>
                      <p className="text-slate-600">+34 690 90 60 27</p>
                      <p className="text-xs text-slate-400 mt-1">Lunes a Viernes</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600 mr-4">
                      <Mail size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Email</h4>
                      <p className="text-slate-600">info@impacto33.com</p>
                      <p className="text-xs text-slate-400 mt-1">Respuesta en 24h</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600 mr-4">
                      <Clock size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Horario</h4>
                      <p className="text-slate-600">09:00 - 14:00</p>
                      <p className="text-slate-600">15:00 - 18:00</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600 mr-4">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Ubicación</h4>
                      <p className="text-slate-600">Tienda Online</p>
                      <p className="text-slate-600">Envíos a toda España</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="md:col-span-2">
              <div className="bg-white p-4 md:p-8 rounded-xl shadow-sm border border-slate-100">
                <JotFormEmbed formId={CONTACT_FORM_ID} height={600} title="Formulario de Contacto" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

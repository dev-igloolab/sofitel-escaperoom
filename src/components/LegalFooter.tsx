type LegalFooterProps = {
  className?: string
}

export function LegalFooter({ className = '' }: LegalFooterProps) {
  return (
    <footer
      className={`max-w-[1180px] px-6 text-center text-[9px] font-medium leading-[1.4] text-white ${className}`}
    >
      <p className="mb-3">MAT-CO-2602166 (07/26)</p>
      <p>
        Este material está dirigido exclusivamente a Profesionales de la Salud,
        con el propósito de brindar información científica y educativa. Para más
        información Sanofi-Aventis de Colombia S.A. Transversal 23 N° 97-73 -
        Edificio City Business. Piso 8. Bogotá D.C.
        <br />
        Teléfono: 621 4400 - Fax: 744 4237 infomedica.colombia@sanofi.com,
        Para reporte de eventos adversos:
        <br />
        Farmacovigilancia.colombia@sanofi.com
      </p>
    </footer>
  )
}

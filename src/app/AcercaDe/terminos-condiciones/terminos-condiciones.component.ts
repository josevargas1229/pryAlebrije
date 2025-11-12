import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';

@Component({
  selector: 'app-terminos-condiciones',
  standalone: true,
  templateUrl: './terminos-condiciones.component.html',
  styleUrls: ['./terminos-condiciones.component.scss'],
})
export class TerminosCondicionesComponent implements OnInit {
  @ViewChild('content', { static: false }) content!: ElementRef;
  documentHTML = '';

  private readonly FALLBACK_HTML = `
  <div class="terminos-condiciones fade-in">
  <h1>Términos y Condiciones</h1>

  <table border="0" style="text-align:left;color:#000000;font-family:Arial,Helvetica,sans-serif;font-weight:lighter;font-size:20px;width:100%;margin-left:10%;padding:0;margin:0;border:none;border-collapse:collapse;" align="center">
    <tr>
      <td style="text-align:center;color:#000000;font-family:Arial,Helvetica,sans-serif;font-weight:bold;font-size:20px;">
        TÉRMINOS Y CONDICIONES DE USO
      </td>
    </tr>
    <tr><td>&nbsp;</td></tr>
  </table>

  <table border="0" style="text-align:left;color:#000000;font-family:Arial,Helvetica,sans-serif;font-weight:lighter;font-size:13px;width:100%;padding:0;border:none;border-collapse:collapse;">
    <tr>
      <td>
        El presente contrato describe los términos y condiciones aplicables al uso del sitio web de Alebrije, con domicilio en calle Velázquez Ibarra 6, colonia Centro, ciudad Huejutla de Reyes, municipio Huejutla de Reyes, C.P. 43000, Hidalgo, México.
        Al ingresar y utilizar este portal, el usuario acepta los términos y condiciones aquí establecidos. Si no está de acuerdo, deberá abstenerse de utilizar el sitio.
      </td>
    </tr>
    <tr><td>&nbsp;</td></tr>

    <tr>
      <td style="font-weight:bold;">1. USO DEL SITIO</td>
    </tr>
    <tr>
      <td>
        El usuario se compromete a utilizar el sitio y sus servicios de conformidad con la ley, la moral, las buenas costumbres y el orden público.
        Queda prohibido el uso del sitio con fines ilícitos o que lesionen derechos de terceros o de Alebrije.
      </td>
    </tr>
    <tr><td>&nbsp;</td></tr>

    <tr>
      <td style="font-weight:bold;">2. PROPIEDAD INTELECTUAL</td>
    </tr>
    <tr>
      <td>
        Todos los contenidos, logotipos, imágenes, diseños, marcas y software presentes en el sitio son propiedad exclusiva de Alebrije o de sus respectivos titulares.
        Queda estrictamente prohibida su reproducción, distribución o modificación sin autorización expresa por escrito.
      </td>
    </tr>
    <tr><td>&nbsp;</td></tr>

    <tr>
      <td style="font-weight:bold;">3. REGISTRO Y CUENTAS DE USUARIO</td>
    </tr>
    <tr>
      <td>
        Para acceder a ciertos servicios, el usuario deberá crear una cuenta proporcionando información veraz y actualizada.
        El usuario es responsable de mantener la confidencialidad de sus credenciales y de toda actividad realizada bajo su cuenta.
      </td>
    </tr>
    <tr><td>&nbsp;</td></tr>

    <tr>
      <td style="font-weight:bold;">4. POLÍTICA DE COMPRAS Y PAGOS</td>
    </tr>
    <tr>
      <td>
        Las compras realizadas a través del sitio están sujetas a disponibilidad de productos, verificación de pago y confirmación de Alebrije.
        Los precios pueden variar sin previo aviso. Todos los pagos se procesan mediante plataformas seguras autorizadas.
      </td>
    </tr>
    <tr><td>&nbsp;</td></tr>

    <tr>
      <td style="font-weight:bold;">5. POLÍTICA DE ENVÍOS Y DEVOLUCIONES</td>
    </tr>
    <tr>
      <td>
        Alebrije realiza envíos a nivel nacional a través de servicios de paquetería.
        Los plazos de entrega varían según la ubicación del cliente.
        En caso de defectos de fábrica o errores en el pedido, el usuario podrá solicitar una devolución o cambio conforme a la política de garantía vigente.
      </td>
    </tr>
    <tr><td>&nbsp;</td></tr>

    <tr>
      <td style="font-weight:bold;">6. LIMITACIÓN DE RESPONSABILIDAD</td>
    </tr>
    <tr>
      <td>
        Alebrije no se hace responsable por daños directos o indirectos derivados del uso del sitio, interrupciones del servicio, errores técnicos o virus informáticos.
        El uso del sitio es bajo riesgo exclusivo del usuario.
      </td>
    </tr>
    <tr><td>&nbsp;</td></tr>

    <tr>
      <td style="font-weight:bold;">7. PRIVACIDAD Y PROTECCIÓN DE DATOS</td>
    </tr>
    <tr>
      <td>
        El tratamiento de los datos personales se realizará conforme a nuestro <b><a href="/aviso-privacidad" target="_blank">Aviso de Privacidad</a></b>.
        El usuario reconoce haber leído y aceptado los términos establecidos en dicho documento.
      </td>
    </tr>
    <tr><td>&nbsp;</td></tr>

    <tr>
      <td style="font-weight:bold;">8. MODIFICACIONES AL CONTENIDO</td>
    </tr>
    <tr>
      <td>
        Alebrije se reserva el derecho de modificar en cualquier momento los contenidos, servicios o políticas del sitio sin previo aviso.
        Las modificaciones entrarán en vigor al ser publicadas en el sitio web.
      </td>
    </tr>
    <tr><td>&nbsp;</td></tr>

    <tr>
      <td style="font-weight:bold;">9. VIGENCIA Y TERMINACIÓN</td>
    </tr>
    <tr>
      <td>
        Estos términos y condiciones estarán vigentes indefinidamente mientras el usuario utilice el sitio.
        Alebrije podrá dar por terminada la prestación del servicio en cualquier momento y sin previo aviso.
      </td>
    </tr>
    <tr><td>&nbsp;</td></tr>

    <tr>
      <td style="font-weight:bold;">10. LEY APLICABLE Y JURISDICCIÓN</td>
    </tr>
    <tr>
      <td>
        Este acuerdo se rige por las leyes vigentes de los Estados Unidos Mexicanos.
        Cualquier controversia derivada será sometida a los tribunales competentes de la ciudad de Huejutla de Reyes, Hidalgo.
      </td>
    </tr>
    <tr><td>&nbsp;</td></tr>

    <tr>
      <td style="font-weight:bold;">11. CONTACTO</td>
    </tr>
    <tr>
      <td>
        Para cualquier aclaración, duda o comentario relacionado con estos términos y condiciones, puede comunicarse con nosotros a través de:
        <br><br>
        <b>Correo electrónico:</b> br_hcruz@hotmail.com<br>
        <b>Teléfono:</b> (77)-110-63-670<br>
        <b>Dirección:</b> Calle Velázquez Ibarra 6, Colonia Centro, Huejutla de Reyes, Hidalgo, México.
      </td>
    </tr>
    <tr><td>&nbsp;</td></tr>

    <tr>
      <td style="font-weight:bold;">12. ACEPTACIÓN DE LOS TÉRMINOS</td>
    </tr>
    <tr>
      <td>
        Al hacer uso del sitio, el usuario reconoce haber leído, comprendido y aceptado los presentes Términos y Condiciones en su totalidad.
      </td>
    </tr>
  </table>

  <table width="100%" align="right" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;">
    <tr><td>&nbsp;</td></tr>
    <tr>
      <td style="text-align:right;">Última actualización: 12/10/2024</td>
    </tr>
  </table>
</div>
  `;

  ngOnInit(): void {
    const fromStorage = localStorage.getItem('pwa.cache.terminosCondicionesHTML');
    this.documentHTML = fromStorage && fromStorage.trim().length > 0
      ? fromStorage
      : this.FALLBACK_HTML;
  }
}

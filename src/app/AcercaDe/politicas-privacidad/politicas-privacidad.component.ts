import { Component, ElementRef, ViewChild, OnInit, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-politicas-privacidad',
  standalone: true,
  templateUrl: './politicas-privacidad.component.html',
  styleUrls: ['./politicas-privacidad.component.scss'],
})
export class PoliticasPrivacidadComponent implements OnInit, AfterViewInit {
  @ViewChild('content', { static: false }) content!: ElementRef;
  documentHTML = '';

  // Fallback embebido por si el storage viene vacío
  private readonly FALLBACK_HTML = `
  <div class="politicas-privacidad fade-in">
  <h1>Políticas de Privacidad</h1>

  <table border="0" style="text-align:left;color:#000000;font-family:Arial,Helvetica,sans-serif;font-weight:lighter;font-size:20px;width:100%;margin-left:10%;padding:0;margin:0;border:none;border-collapse:collapse;" align="center">
    <tr>
      <td style="text-align:center;color:#000000;font-family:Arial,Helvetica,sans-serif;font-weight:bold;font-size:20px;">
        AVISO DE PRIVACIDAD
      </td>
    </tr>
    <tr><td>&nbsp;</td></tr>
  </table>

  <table border="0" style="text-align:left;color:#000000;font-family:Arial,Helvetica,sans-serif;font-weight:lighter;font-size:13px;width:100%;padding:0;border:none;border-collapse:collapse;">
    <tr>
      <td>
        Alebrije, mejor conocido como Alebrije, con domicilio en calle Velázquez Ibarra 6, colonia Centro, ciudad Huejutla de Reyes, municipio Huejutla de Reyes, C.P. 43000, en la entidad de Hidalgo, país México, es el responsable del uso y protección de sus datos personales, y al respecto le informamos lo siguiente:
      </td>
    </tr>
    <tr><td>&nbsp;</td></tr>
    <tr>
      <td style="font-weight:bold;">¿Para qué fines utilizaremos sus datos personales?</td>
    </tr>
    <tr><td>&nbsp;</td></tr>
    <tr>
      <td>Los datos personales que recabamos de usted se utilizarán para las siguientes finalidades necesarias para el servicio que solicita:</td>
    </tr>
    <tr><td>&nbsp;</td></tr>
    <tr>
      <td>
        De manera adicional, utilizaremos su información personal para las siguientes finalidades secundarias que <b>no son necesarias</b> para el servicio solicitado, pero que nos permiten brindarle una mejor atención:
        <ul>
          <li>Para verificar y confirmar su identidad</li>
          <li>Mercadotecnia o publicitaria</li>
          <li>Prospección comercial</li>
        </ul>
        En caso de que no desee que sus datos personales se utilicen para estos fines secundarios, indíquelo a continuación:<br><br>
        No consiento que mis datos personales se utilicen para los siguientes fines:<br><br>
        <font size="4">[&nbsp;&nbsp;]</font> Para verificar y confirmar su identidad<br>
        <font size="4">[&nbsp;&nbsp;]</font> Mercadotecnia o publicitaria<br>
        <font size="4">[&nbsp;&nbsp;]</font> Prospección comercial<br><br>
        La negativa para el uso de sus datos personales para estas finalidades no podrá ser un motivo para que le neguemos los servicios y productos que solicita o contrata con nosotros.
      </td>
    </tr>
    <tr><td>&nbsp;</td></tr>
    <tr>
      <td style="font-weight:bold;">¿Qué datos personales utilizaremos para estos fines?</td>
    </tr>
    <tr><td>&nbsp;</td></tr>
    <tr>
      <td>
        Para llevar a cabo las finalidades descritas, utilizaremos los siguientes datos personales:
        <ul>
          <li>Nombre</li>
          <li>Domicilio</li>
          <li>Correo electrónico</li>
        </ul>
      </td>
    </tr>
  </table>

  <table align="center" style="width:100%;font-family:Arial,Helvetica,sans-serif;font-size:13px;border-collapse:collapse;">
    <tr>
      <td style="font-weight:bold;"><br>¿Cómo puede acceder, rectificar o cancelar sus datos personales, u oponerse a su uso?</td>
    </tr>
    <tr><td>&nbsp;</td></tr>
    <tr>
      <td>
        Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos y las condiciones del uso que les damos (Acceso).
        Asimismo, es su derecho solicitar la corrección de su información personal en caso de que esté desactualizada, sea inexacta o incompleta (Rectificación);
        que la eliminemos de nuestros registros o bases de datos cuando considere que la misma no está siendo utilizada adecuadamente (Cancelación);
        así como oponerse al uso de sus datos personales para fines específicos (Oposición). Estos derechos se conocen como derechos ARCO.<br><br>
        Para el ejercicio de cualquiera de los derechos ARCO, usted deberá presentar la solicitud respectiva a través del siguiente medio:<br><br>
        Llamando al número telefónico (77)-110-63-670<br><br>
        Para conocer el procedimiento y requisitos, ponemos a su disposición el mismo número telefónico.
      </td>
    </tr>
  </table>

  <table align="left" style="width:100%;font-family:Arial,Helvetica,sans-serif;font-size:13px;border-collapse:collapse;">
    <tr>
      <td>
        <br><b>Departamento de datos personales:</b><br><br>
        a) Responsable: Bernardo Hernández Cruz<br>
        b) Domicilio: Calle Velázquez Ibarra 6, colonia Centro, Huejutla de Reyes, Hidalgo, C.P. 43000<br>
        c) Correo electrónico: br_hcruz@hotmail.com
      </td>
    </tr>
  </table>

  <table align="left" style="width:100%;font-family:Arial,Helvetica,sans-serif;font-size:13px;border-collapse:collapse;">
    <tr>
      <td>
        <br><b>Revocación del consentimiento</b><br><br>
        Usted puede revocar el consentimiento otorgado para el tratamiento de sus datos personales. Sin embargo, es posible que no en todos los casos podamos atender su solicitud o concluir el uso de forma inmediata,
        ya que puede existir una obligación legal de seguir tratando sus datos personales.<br><br>
        Para revocar su consentimiento, presente su solicitud a través del siguiente medio:<br><br>
        Desde la página web<br><br>
        Para conocer el procedimiento y requisitos, ponemos a su disposición el siguiente medio:<br><br>
        Desde la página de Internet<br><br>
      </td>
    </tr>
  </table>

  <table align="center" style="width:100%;font-family:Arial,Helvetica,sans-serif;font-size:13px;border-collapse:collapse;">
    <tr>
      <td style="font-weight:bold;"><br>¿Cómo puede limitar el uso o divulgación de su información personal?</td>
    </tr>
    <tr><td>&nbsp;</td></tr>
    <tr>
      <td>Con objeto de que usted pueda limitar el uso y divulgación de su información personal, le ofrecemos los siguientes medios:<br><br>Desde la página de Internet<br><br></td>
    </tr>
  </table>

  <table align="left" style="width:100%;font-family:Arial,Helvetica,sans-serif;font-size:13px;border-collapse:collapse;">
    <tr>
      <td style="font-weight:bold;"><br>¿Cómo puede conocer los cambios en este aviso de privacidad?</td>
    </tr>
    <tr><td>&nbsp;</td></tr>
    <tr>
      <td>
        El presente aviso puede sufrir modificaciones derivadas de nuevos requerimientos legales o de cambios en nuestras prácticas de privacidad.<br><br>
        Nos comprometemos a mantenerlo informado sobre los cambios mediante correo electrónico.<br><br>
        El procedimiento será mediante un aviso por correo electrónico notificando las actualizaciones del presente aviso de privacidad.
      </td>
    </tr>
  </table>

  <table align="left" style="width:100%;font-family:Arial,Helvetica,sans-serif;font-size:13px;border-collapse:collapse;">
    <tr><td>&nbsp;</td></tr>
    <tr>
      <td>
        <b>Su consentimiento para el tratamiento de sus datos personales</b><br><br>
        Consiento que mis datos personales sean tratados de conformidad con los términos y condiciones informados en el presente aviso de privacidad.<b>[&nbsp;&nbsp;]</b>
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
    const fromStorage = localStorage.getItem('pwa.cache.avisoPrivacidadHTML');
    this.documentHTML = fromStorage && fromStorage.trim().length > 0
      ? fromStorage
      : this.FALLBACK_HTML;
  }
   ngAfterViewInit() { queueMicrotask(() => this.content?.nativeElement.classList.add('show')); }
}

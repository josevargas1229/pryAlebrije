import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

interface ProductoLista {
  id: number;
  nombre: string;
}

export interface DetalleProductoCache {
  id: number;
  tipoProducto: string;
  marca: string;
  categoria: string;
  talla: string;
  color: string;
  precio: number;
  imagen: string;
  stock: number;
  talla_id: number | null;
  color_id: number | null;
}

@Injectable({ providedIn: 'root' })
export class PrecacheService {
  private http = inject(HttpClient);

  private readonly API_BASE = 'https://alebrije.onrender.com';

  private readonly PRIVACIDAD_HTML = `
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

private readonly TERMINOS_HTML = `
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

  preloadCriticalData() {
    //LISTA DE PRODUCTOS
    const productosTop10$ = this.http
      .get<ProductoLista[]>(`${this.API_BASE}/menu-catalogo/productos`)
      .pipe(
        map(items => items.slice(0, 10)),
        tap(items => {
          localStorage.setItem(
            'pwa.cache.productosTop10',
            JSON.stringify(items)
          );
        }),
        catchError(err => {
          console.error('Error precargando lista de productos', err);
          return of([] as ProductoLista[]);
        })
      );

      const staticDocs$ = of(true).pipe(
  tap(() => {
    localStorage.setItem('pwa.cache.avisoPrivacidadHTML', this.PRIVACIDAD_HTML);
    localStorage.setItem('pwa.cache.terminosCondicionesHTML', this.TERMINOS_HTML);
  })
);

    //PRECARGAR DETALLES
    const detallesTop10$ = productosTop10$.pipe(
      switchMap(productos => {
        if (!productos.length) return of([] as DetalleProductoCache[]);

        const detailRequests = productos.map(p =>
          this.http
            .get<any>(
              `${this.API_BASE}/menu-catalogo/productos/producto-detalle/${p.id}`
            )
            .pipe(
              map(prod => this.mapDetalleProducto(prod)),
              catchError(err => {
                console.error(
                  'Error precargando detalle de producto',
                  p.id,
                  err
                );
                return of(null as DetalleProductoCache | null);
              })
            )
        );

        return forkJoin(detailRequests).pipe(
          map(detalles =>
            detalles.filter(
              (d): d is DetalleProductoCache => d !== null
            )
          ),
          tap(detalles => {
            localStorage.setItem(
              'pwa.cache.productosDetallesTop10',
              JSON.stringify(detalles)
            );
          })
        );
      })
    );
    const contacto$ = this.http
      .get(`${this.API_BASE}/contacto`, { responseType: 'text' })
      .pipe(
        tap(html => {
          localStorage.setItem('pwa.cache.contacto', html);
        }),
        catchError(err => {
          console.error('Error precargando contacto', err);
          return of(null);
        })
      );

    return forkJoin({
      productosTop10: productosTop10$,
      detallesTop10: detallesTop10$,
      staticDocs: staticDocs$,
      contacto: contacto$
    });
  }


  private mapDetalleProducto(producto: any): DetalleProductoCache {


    const variantes = producto.variantes || producto.variantesProducto || [];
    const varianteConStock =
      variantes.find((v: any) => v.stock > 0) ||
      variantes[0] ||
      {};

    const talla =
      varianteConStock.talla?.nombre ||
      varianteConStock.tallaNombre ||
      'Sin talla';

    const color =
      varianteConStock.color?.nombre ||
      varianteConStock.colorNombre ||
      'Color desconocido';

    const talla_id =
      varianteConStock.talla_id ??
      varianteConStock.tallaId ??
      null;

    const color_id =
      varianteConStock.color_id ??
      varianteConStock.colorId ??
      null;

    return {
      id: producto.id,
      tipoProducto: producto.tipo?.nombre || 'Tipo desconocido',
      marca: producto.marca?.nombre || 'Marca desconocida',
      categoria: producto.categoria?.nombre || 'Categoría desconocida',
      talla,
      color,
      precio: producto.precio,
      imagen: producto.imagenPrincipal || 'assets/images/ropa.jpg',
      stock: varianteConStock.stock ?? 0,
      talla_id,
      color_id
    };
  }


  getCachedProductosTop10(): ProductoLista[] {
    const raw = localStorage.getItem('pwa.cache.productosTop10');
    return raw ? JSON.parse(raw) : [];
  }

  getCachedDetallesTop10(): DetalleProductoCache[] {
    const raw = localStorage.getItem('pwa.cache.productosDetallesTop10');
    return raw ? JSON.parse(raw) : [];
  }

  getCachedContacto(): string | null {
    return localStorage.getItem('pwa.cache.contacto');
  }

  getCachedDetalleById(id: number): DetalleProductoCache | undefined {
    const all = this.getCachedDetallesTop10();
    return all.find(d => d.id === id);
  }
}

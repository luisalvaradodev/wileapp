// components/SalesReportPDFDocument.tsx
'use client';

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { SaleRecordWithId } from '../../lib/actions'; // O donde tengas este tipo
import { formatCurrency, formatDate } from '../../lib/utils'; // O donde tengas estas utilidades

// --- REGISTRO DE FUENTES (CRUCIAL) ---
// Asegúrate de que estas rutas sean accesibles por @react-pdf/renderer en tu entorno.
// Es posible que necesites URLs absolutas o cargar las fuentes como ArrayBuffer.
// Si esto falla, el PDF usará Helvetica.
try {
  Font.register({
    family: 'Inter',
    fonts: [
      { src: '/fonts/Inter-Regular.ttf', fontWeight: 400 },
      { src: '/fonts/Inter-Medium.ttf', fontWeight: 500 },
      { src: '/fonts/Inter-SemiBold.ttf', fontWeight: 600 },
      { src: '/fonts/Inter-Bold.ttf', fontWeight: 700 },
    ],
  });
  Font.registerHyphenationCallback(word => [word]); // Evita errores de hyphenation si no se configura
} catch (error) {
  console.error("Error al registrar fuentes para PDF:", error);
  // El PDF usará fuentes por defecto (Helvetica)
}
// --- FIN REGISTRO DE FUENTES ---

const PRIMARY_COLOR = '#267D94'; // Un verde azulado corporativo
const TEXT_COLOR_DARK = '#1A202C'; // Casi negro
const TEXT_COLOR_MEDIUM = '#4A5568'; // Gris oscuro
const TEXT_COLOR_LIGHT = '#718096'; // Gris medio
const BORDER_COLOR = '#E2E8F0'; // Gris claro para bordes
const BACKGROUND_LIGHT = '#F7FAFC'; // Fondo muy claro para acentos

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 35,
    paddingVertical: 30,
    fontFamily: 'Inter', // Intentará usar Inter, fallback a Helvetica
    fontSize: 9,
    color: TEXT_COLOR_MEDIUM,
    lineHeight: 1.4,
  },
  // Encabezado y Pie de Página
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // Cambiado para alinear logo y texto
    marginBottom: 25,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  // logo: { width: 80, height: 40 }, // Descomentar si tienes un logo
  headerTextContainer: {
    textAlign: 'right',
  },
  storeName: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: 700, // Bold
    color: PRIMARY_COLOR,
    marginBottom: 4,
  },
  reportTitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: 600, // SemiBold
    color: TEXT_COLOR_DARK,
    marginBottom: 4,
  },
  reportDate: {
    fontFamily: 'Inter',
    fontSize: 9,
    color: TEXT_COLOR_LIGHT,
  },
  footer: {
    position: 'absolute',
    bottom: 20, // Ajustado para más espacio
    left: 35,
    right: 35,
    textAlign: 'center',
    fontSize: 7,
    color: '#A0AEC0', // Gris más claro
    borderTopWidth: 0.5,
    borderTopColor: BORDER_COLOR,
    paddingTop: 8,
  },
  pageNumber: { // Para numeración de página
    position: 'absolute',
    fontSize: 7,
    bottom: 8,
    left: 0,
    right: 35,
    textAlign: 'right',
    color: '#A0AEC0',
  },

  // Secciones
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: 600, // SemiBold
    color: TEXT_COLOR_DARK,
    backgroundColor: BACKGROUND_LIGHT,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 10,
    borderRadius: 3,
    borderLeftWidth: 3,
    borderLeftColor: PRIMARY_COLOR,
  },

  // Filas de Información (para Tasa, etc.)
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Para que los items pasen a la siguiente línea si no caben
  },
  infoItem: {
    flexDirection: 'row',
    paddingVertical: 3, // Espaciado vertical
    width: '50%', // Dos items por fila
    alignItems: 'center', // Alinea el texto verticalmente si es multilínea
  },
  infoLabel: {
    fontFamily: 'Inter',
    fontSize: 9,
    fontWeight: 500, // Medium
    color: TEXT_COLOR_MEDIUM,
    marginRight: 5,
  },
  infoValue: {
    fontFamily: 'Inter',
    fontSize: 9,
    color: TEXT_COLOR_DARK,
    flexShrink: 1, // Permite que el texto se ajuste si es largo
  },

  // Tabla de Registros
  table: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 3,
    marginBottom: 10,
    overflow: 'hidden', // Para que el borderRadius afecte a los hijos
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: PRIMARY_COLOR,
    borderBottomWidth: 1,
    borderBottomColor: PRIMARY_COLOR, // Color más oscuro para la línea del header
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  tableRowZebra: { // Para filas alternas
    backgroundColor: BACKGROUND_LIGHT,
  },
  tableColHeader: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    fontFamily: 'Inter',
    fontSize: 8,
    fontWeight: 600, // SemiBold
    color: '#FFFFFF', // Texto blanco para header
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.2)', // Línea divisora sutil en header
  },
  tableCol: {
    paddingVertical: 5,
    paddingHorizontal: 4,
    fontSize: 8,
    fontFamily: 'Inter',
    borderRightWidth: 1,
    borderRightColor: BORDER_COLOR,
  },
  // Definición de anchos de columna
  colNarrow: { width: '11%' }, // Hora, Gasto
  colMedium: { width: '14%' }, // Divisas, Efectivo, Tarjeta, P.Móvil
  colWide: { width: '22%' },   // Total Venta (si es una columna única, o ajustar)
  
  // Ajustes específicos de alineación para celdas
  textCenter: { textAlign: 'center' },
  textRight: { textAlign: 'right' },
  textLeft: { textAlign: 'left' },

  // Tabla de Resumen
  summaryContainer: {
    // paddingLeft: '50%', // Para alinear a la derecha si es un bloque
    marginTop: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Alinea label a la izq y value a la der
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  summaryRowTotal: { // Para el INGRESO NETO
    borderTopWidth: 1.5,
    borderTopColor: TEXT_COLOR_DARK,
    marginTop: 5,
    paddingTop: 5,
  },
  summaryLabel: {
    fontFamily: 'Inter',
    fontSize: 9,
    fontWeight: 500, // Medium
    color: TEXT_COLOR_MEDIUM,
  },
  summaryValue: {
    fontFamily: 'Inter',
    fontSize: 9,
    fontWeight: 500, // Medium
    color: TEXT_COLOR_DARK,
    textAlign: 'right',
  },
  summaryValueStrong: { // Para el INGRESO NETO
    fontWeight: 700, // Bold
    fontSize: 10,
  },
  
  // Notas Adicionales
  notesText: {
    fontSize: 7,
    color: TEXT_COLOR_LIGHT,
    marginTop: 8,
    fontStyle: 'italic',
  }
});

interface SalesReportPDFDocumentProps {
  reportDate: string;
  records: SaleRecordWithId[];
  exchangeRateInfo: { rate: number; lastUpdate: string };
  dailyBalances: { usd_balance: number; bs_balance: number };
  storeName?: string;
  storeLogoUrl?: string; // Opcional: URL del logo de la tienda
}

export const SalesReportPDFDocument: React.FC<SalesReportPDFDocumentProps> = ({
  reportDate,
  records,
  exchangeRateInfo,
  dailyBalances,
  storeName = "Nombre de Tienda",
  storeLogoUrl,
}) => {
  let overallDailyTotalBs = 0;
  let overallDailyTotalUsdReceived = 0;
  let overallDailyGastoBs = 0;

  const sortedRecords = [...records].sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  sortedRecords.forEach(record => {
    overallDailyTotalBs += record.total_ventas_bs;
    overallDailyTotalUsdReceived += record.usd_received;
    overallDailyGastoBs += record.gasto_bs;
  });

  const netIncomeBs = overallDailyTotalBs - overallDailyGastoBs;
  const totalDivisasInBs = overallDailyTotalUsdReceived * exchangeRateInfo.rate;

  const formatDateForDisplay = (dateStr: string) => formatDate(dateStr); // Usar tu función existente
  const formatTimeForDisplay = (dateStr: string) => new Date(dateStr).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit'});

  return (
    <Document author={storeName} title={`Reporte de Ventas - ${storeName} - ${formatDateForDisplay(reportDate)}`}>
      <Page size="A4" style={styles.page} orientation="portrait">
        {/* Encabezado */}
        <View style={styles.headerContainer}>
          {storeLogoUrl && <Image src={storeLogoUrl} style={{ width: 70, height: 35, marginRight: 15 /* Ajusta según tu logo */ }} />}
          <View style={{flexGrow: 1}}>
            <Text style={styles.storeName}>{storeName}</Text>
            <Text style={styles.reportTitle}>Reporte de Ventas Diarias</Text>
            <Text style={styles.reportDate}>Fecha del Reporte: {formatDateForDisplay(reportDate)}</Text>
          </View>
        </View>

        {/* Sección de Información General */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información General</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Tasa del Día (BCV):</Text>
              <Text style={styles.infoValue}>{formatCurrency(exchangeRateInfo.rate, 'VES').replace(' Bs.', '')} Bs. / USD</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Actualización Tasa:</Text>
              <Text style={styles.infoValue}>{formatDate(exchangeRateInfo.lastUpdate) /* Solo pasa el primer argumento, o agrega un formato válido como segundo argumento si lo deseas */}</Text>
            </View>
          </View>
        </View>

        {/* Sección de Registros de Ventas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Registros de Ventas del Día ({sortedRecords.length})</Text>
          <View style={styles.table}>
            {/* Encabezado de Tabla */}
            <View style={styles.tableHeader} fixed>
              <Text style={[styles.tableColHeader, styles.colNarrow, styles.textCenter]}>Hora</Text>
              <Text style={[styles.tableColHeader, styles.colMedium, styles.textRight]}>Divisas ($)</Text>
              <Text style={[styles.tableColHeader, styles.colMedium, styles.textRight]}>Efectivo (Bs)</Text>
              <Text style={[styles.tableColHeader, styles.colMedium, styles.textRight]}>Tarjeta (Bs)</Text>
              <Text style={[styles.tableColHeader, styles.colMedium, styles.textRight]}>P. Móvil (Bs)</Text>
              <Text style={[styles.tableColHeader, styles.colNarrow, styles.textRight]}>Gasto (Bs)</Text>
              <Text style={[styles.tableColHeader, {flex:1, borderRightWidth:0 /* Última columna sin borde der. */}, styles.textRight]}>Total Venta (Bs)</Text>
            </View>
            {/* Filas de Tabla */}
            {sortedRecords.length > 0 ? sortedRecords.map((record, index) => {
              const rowStyles = index % 2 !== 0
                ? [styles.tableRow, styles.tableRowZebra]
                : [styles.tableRow];
              return (
                <View style={rowStyles} key={record.id || `record-${index}`} wrap={false}>
                  <Text style={[styles.tableCol, styles.colNarrow, styles.textCenter]}>
                    {record.created_at ? formatTimeForDisplay(record.created_at) : 'N/A'}
                  </Text>
                  <Text style={[styles.tableCol, styles.colMedium, styles.textRight]}>
                    {formatCurrency(record.usd_received, 'USD')}
                  </Text>
                  <Text style={[styles.tableCol, styles.colMedium, styles.textRight]}>
                    {formatCurrency(record.efectivo_bs, 'VES')}
                  </Text>
                  <Text style={[styles.tableCol, styles.colMedium, styles.textRight]}>
                    {formatCurrency(record.tarjeta_bs, 'VES')}
                  </Text>
                  <Text style={[styles.tableCol, styles.colMedium, styles.textRight]}>
                    {formatCurrency(record.pago_movil_bs, 'VES')}
                  </Text>
                  <Text style={[
                    styles.tableCol,
                    styles.colNarrow,
                    styles.textRight,
                    { color: record.gasto_bs > 0 ? '#E53E3E' : TEXT_COLOR_DARK }
                  ]}>
                    {formatCurrency(record.gasto_bs, 'VES')}
                  </Text>
                  <Text style={[
                    styles.tableCol,
                    { flex: 1, borderRightWidth: 0 },
                    styles.textRight,
                    { fontWeight: 500 }
                  ]}>
                    {formatCurrency(record.total_ventas_bs, 'VES')}
                  </Text>
                </View>
              );
            }) : (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCol, {width: '100%', textAlign: 'center', paddingVertical: 10, borderRightWidth:0}]}>No hay registros para esta fecha.</Text>
              </View>
            )}
          </View>
        </View>

        {/* Sección de Resumen del Día */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen del Día</Text>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Divisas Recibidas ($):</Text>
              <Text style={styles.summaryValue}>{formatCurrency(overallDailyTotalUsdReceived, 'USD')}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Divisas en Bs (Tasa: {formatCurrency(exchangeRateInfo.rate, 'VES')}/USD):</Text>
              <Text style={styles.summaryValue}>{formatCurrency(totalDivisasInBs, 'VES')}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Ventas Brutas (Bs):</Text>
              <Text style={styles.summaryValue}>{formatCurrency(overallDailyTotalBs, 'VES')}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Gastos (Bs):</Text>
              <Text style={[styles.summaryValue, {color: '#E53E3E', fontWeight: 500 /* Rojo para gastos */}]}>{formatCurrency(overallDailyGastoBs, 'VES')}</Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryRowTotal]}>
              <Text style={[styles.summaryLabel, styles.summaryValueStrong]}>INGRESO NETO DEL DÍA (Bs):</Text>
              <Text style={[styles.summaryValue, styles.summaryValueStrong]}>{formatCurrency(netIncomeBs, 'VES')}</Text>
            </View>
          </View>
        </View>
        
        {/* Sección de Saldos Acumulados */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saldos Acumulados (Cierre del Día)</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Saldo Acumulado Divisas ($):</Text>
              <Text style={styles.infoValue}>{formatCurrency(dailyBalances.usd_balance, 'USD')}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Saldo Acumulado Bolívares (Bs.):</Text>
              <Text style={styles.infoValue}>{formatCurrency(dailyBalances.bs_balance, 'VES')}</Text>
            </View>
          </View>
          <Text style={styles.notesText}>
            Nota: Los saldos acumulados reflejan el total disponible al cierre del día {formatDateForDisplay(reportDate)}.
          </Text>
        </View>

        {/* Pie de Página */}
        <Text style={styles.footer} fixed>
          Reporte generado el {new Date().toLocaleDateString('es-VE', { day: '2-digit', month: 'long', year: 'numeric' })} a las {new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', hour12: true })}.
        </Text>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} fixed />
      </Page>
    </Document>
  );
};
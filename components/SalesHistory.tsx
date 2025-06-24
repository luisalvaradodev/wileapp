import React from 'react';
import { 
    ListFilter, Edit2, Trash2, CalendarIcon, AlertTriangle, Info, CheckCircle, XCircle, Loader2,
    DollarSign, Coins, Banknote, CreditCard, Smartphone, ShoppingCart, TrendingUp, ArrowRightLeft, FileText,
    ChevronDown, ExternalLink, ReceiptText, RefreshCcw // Nuevos iconos
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/actions'; // Asegúrate que la ruta sea correcta
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// --- INICIO DE DEFINICIONES DE TIPOS Y COMPONENTES AUXILIARES ---

// Ejemplo de registro de fuente para el PDF (opcional)
// Font.register({ 
//   family: 'Inter', 
//   fonts: [
//     { src: '/fonts/Inter-Regular.ttf' },
//     { src: '/fonts/Inter-Bold.ttf', fontWeight: 'bold' },
//   ]
// });

const pdfStyles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica', // Cambiar a 'Inter' si se registra
    fontSize: 9,
    paddingTop: 35,
    paddingLeft: 35,
    paddingRight: 35,
    paddingBottom: 30,
    lineHeight: 1.4,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB', // Gris claro
  },
  storeName: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' /* Gris oscuro */ },
  reportTitle: { fontSize: 14, color: '#4B5563' /* Gris medio */, textAlign: 'right'},
  section: { marginBottom: 15 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 8, color: '#111827', /* Casi negro */ borderBottomWidth: 0.5, borderBottomColor: '#D1D5DB', paddingBottom: 3 },
  recordItem: { 
    borderWidth: 1, 
    borderColor: '#F3F4F6', /* Gris muy claro */ 
    borderRadius: 5, 
    padding: 8, 
    marginBottom: 8,
    backgroundColor: '#FAFAFB',
  },
  recordHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  recordId: { fontWeight: 'bold', fontSize: 10, color: '#374151' },
  recordTime: { fontSize: 9, color: '#6B7280' },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  detailItem: { width: '50%', paddingVertical: 2, flexDirection: 'row', alignItems: 'center' },
  detailLabel: { color: '#4B5563', fontSize: 9 },
  detailValue: { fontWeight: 'bold', color: '#1F2937', fontSize: 9, marginLeft: 3 },
  totalVentaValue: { fontWeight: 'bold', color: '#059669' /* Verde */, fontSize: 10 },
  gastoValue: { fontWeight: 'bold', color: '#DC2626' /* Rojo */, fontSize: 9 },
  summarySection: { marginTop: 20, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3},
  summaryLabel: { fontSize: 10, color: '#374151'},
  summaryValue: { fontSize: 10, fontWeight: 'bold', color: '#111827'},
  footer: { position: 'absolute', fontSize: 7, bottom: 15, left: 35, right: 35, textAlign: 'center', color: '#9CA3AF' /* Gris claro */ },
  // logo: { width: 40, height: 40, marginRight: 10 }, // Si tienes un logo
});

interface SalesReportPDFDocumentProps {
  reportDate: string;
  records: SaleRecordWithId[];
  exchangeRateInfo: ExchangeRateInfo;
  storeName: string;
  // logoUrl?: string; // Opcional para el logo
}

const SalesReportPDFDocument: React.FC<SalesReportPDFDocumentProps> = ({ reportDate, records, exchangeRateInfo, storeName /*, logoUrl */ }) => {
  const totalVentasDelDia = records.reduce((sum, rec) => sum + rec.total_ventas_bs, 0);
  const totalGastosDelDia = records.reduce((sum, rec) => sum + rec.gasto_bs, 0);

  return (
  <Document title={`Reporte Ventas ${storeName} - ${formatDate(reportDate)}`}>
    <Page size="A4" style={pdfStyles.page}>
      <View style={pdfStyles.header}>
        {/* {logoUrl && <Image style={pdfStyles.logo} src={logoUrl} />} */}
        <Text style={pdfStyles.storeName}>{storeName}</Text>
        <Text style={pdfStyles.reportTitle}>Reporte de Ventas</Text>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Información General</Text>
        <Text><Text style={pdfStyles.detailLabel}>Fecha del Reporte: </Text><Text style={pdfStyles.detailValue}>{formatDate(reportDate)}</Text></Text>
        {exchangeRateInfo && !exchangeRateInfo.isError && (
          <Text>
            <Text style={pdfStyles.detailLabel}>Tasa de Cambio (BCV): </Text>
            <Text style={pdfStyles.detailValue}>{formatCurrency(exchangeRateInfo.rate, 'VES').replace(' Bs.', '')} Bs./USD</Text>
            <Text style={{fontSize: 8, color: '#6B7280'}}> (Actualizado: {formatDate(exchangeRateInfo.lastUpdate, 'dd/mm/yy')})</Text>
          </Text>
        )}
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Detalle de Transacciones ({records.length})</Text>
        {records.map((record) => (
          <View key={record.id} style={pdfStyles.recordItem}>
            <View style={pdfStyles.recordHeader}>
              <Text style={pdfStyles.recordId}>ID: {record.id.substring(0,8)}</Text>
              <Text style={pdfStyles.recordTime}>{new Date(record.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
            </View>
            <View style={pdfStyles.detailGrid}>
              <View style={{...pdfStyles.detailItem, width: '100%', marginBottom: 2}}>
                  <Text style={pdfStyles.detailLabel}>Total Venta: </Text>
                  <Text style={pdfStyles.totalVentaValue}>{formatCurrency(record.total_ventas_bs, 'VES')}</Text>
              </View>
              <View style={pdfStyles.detailItem}><Text style={pdfStyles.detailLabel}>Divisas ($): </Text><Text style={pdfStyles.detailValue}>{formatCurrency(record.usd_received, 'USD')}</Text></View>
              <View style={pdfStyles.detailItem}><Text style={pdfStyles.detailLabel}>Tasa Aplicada: </Text><Text style={pdfStyles.detailValue}>{formatCurrency(record.exchange_rate, 'VES').replace(' Bs.','')}</Text></View>
              <View style={pdfStyles.detailItem}><Text style={pdfStyles.detailLabel}>Efectivo (Bs): </Text><Text style={pdfStyles.detailValue}>{formatCurrency(record.efectivo_bs, 'VES')}</Text></View>
              <View style={pdfStyles.detailItem}><Text style={pdfStyles.detailLabel}>Divisas (Bs): </Text><Text style={pdfStyles.detailValue}>{formatCurrency(record.calculated_divisas_bs, 'VES')}</Text></View>
              <View style={pdfStyles.detailItem}><Text style={pdfStyles.detailLabel}>Tarjeta (Bs): </Text><Text style={pdfStyles.detailValue}>{formatCurrency(record.tarjeta_bs, 'VES')}</Text></View>
              <View style={pdfStyles.detailItem}><Text style={pdfStyles.detailLabel}>Pago Móvil (Bs): </Text><Text style={pdfStyles.detailValue}>{formatCurrency(record.pago_movil_bs, 'VES')}</Text></View>
              <View style={{...pdfStyles.detailItem, width: '100%'}}><Text style={pdfStyles.detailLabel}>Gastos (Bs): </Text><Text style={pdfStyles.gastoValue}>{formatCurrency(record.gasto_bs, 'VES')}</Text></View>
            </View>
          </View>
        ))}
      </View>
      
      <View style={[pdfStyles.section, pdfStyles.summarySection]}>
        <Text style={pdfStyles.sectionTitle}>Resumen del Día</Text>
        <View style={pdfStyles.summaryRow}><Text style={pdfStyles.summaryLabel}>Total Ventas Brutas (Bs.):</Text><Text style={pdfStyles.summaryValue}>{formatCurrency(totalVentasDelDia, 'VES')}</Text></View>
        <View style={pdfStyles.summaryRow}><Text style={pdfStyles.summaryLabel}>Total Gastos (Bs.):</Text><Text style={[pdfStyles.summaryValue, {color: '#DC2626'}]}>{formatCurrency(totalGastosDelDia, 'VES')}</Text></View>
        <View style={[pdfStyles.summaryRow, {marginTop: 5, paddingTop: 5, borderTopWidth: 0.5, borderTopColor: '#E5E7EB'}]}>
            <Text style={[pdfStyles.summaryLabel, {fontWeight: 'bold'}]}>Ventas Netas (Bs.):</Text>
            <Text style={[pdfStyles.summaryValue, {fontSize: 11}]}>{formatCurrency(totalVentasDelDia - totalGastosDelDia, 'VES')}</Text>
        </View>
      </View>

      <Text style={pdfStyles.footer}>
        Reporte generado automáticamente el {new Date().toLocaleDateString('es-VE')} a las {new Date().toLocaleTimeString('es-VE')}.
      </Text>
    </Page>
  </Document>
)};

// Interfaces
export interface SaleRecordWithId {
  id: string;
  user_id: string;
  date: string;
  exchange_rate: number;
  usd_received: number;
  efectivo_bs: number;
  tarjeta_bs: number;
  pago_movil_bs: number;
  gasto_bs: number;
  calculated_divisas_bs: number;
  total_ventas_bs: number;
  created_at: string;
}

interface ExchangeRateInfo {
  rate: number;
  lastUpdate: string;
  isError: boolean;
}

interface StatusDisplayProps {
  type: 'info' | 'success' | 'warning' | 'error' | 'loading';
  message: string | React.ReactNode;
  className?: string;
  iconSize?: number;
}

const StatusDisplayComponent: React.FC<StatusDisplayProps> = ({ type, message, className, iconSize = 20 }) => {
  const icons: Record<StatusDisplayProps['type'], React.ReactElement> = {
    info: <Info size={iconSize} className="text-sky-500" />,
    success: <CheckCircle size={iconSize} className="text-green-500" />,
    warning: <AlertTriangle size={iconSize} className="text-amber-500" />,
    error: <XCircle size={iconSize} className="text-red-500" />,
    loading: <Loader2 size={iconSize} className="animate-spin text-slate-500 dark:text-slate-400" />,
  };
  const baseClasses: Record<StatusDisplayProps['type'], string> = {
    info: 'bg-sky-50 dark:bg-sky-900/30 border-sky-500/30 text-sky-700 dark:text-sky-300',
    success: 'bg-green-50 dark:bg-green-900/30 border-green-500/30 text-green-700 dark:text-green-300',
    warning: 'bg-amber-50 dark:bg-amber-900/30 border-amber-500/30 text-amber-700 dark:text-amber-300',
    error: 'bg-red-50 dark:bg-red-900/30 border-red-500/30 text-red-700 dark:text-red-300',
    loading: 'bg-slate-100 dark:bg-slate-800/50 border-slate-500/20 text-slate-700 dark:text-slate-300',
  };

  return (
    <div className={`p-3.5 rounded-lg border flex items-center space-x-3 shadow-sm ${baseClasses[type]} ${className}`}>
      <span className="flex-shrink-0">{icons[type]}</span>
      <div className="text-sm font-medium">
        {message}
      </div>
    </div>
  );
};

const SkeletonCardComponent: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-800/70 p-4 rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 animate-pulse">
      <div className="flex justify-between items-center mb-3.5 pb-2 border-b border-slate-200 dark:border-slate-700">
        <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-2/5"></div>
        <div className="flex space-x-2">
          <div className="h-7 w-7 bg-slate-300 dark:bg-slate-600 rounded-md"></div>
          <div className="h-7 w-7 bg-slate-300 dark:bg-slate-600 rounded-md"></div>
        </div>
      </div>
      <div className="h-6 bg-slate-300 dark:bg-slate-600 rounded w-3/4 mb-4"></div>
      <div className="space-y-2.5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center justify-between py-1">
            <div className="h-3.5 bg-slate-300 dark:bg-slate-600 rounded w-1/4"></div>
            <div className="h-3.5 bg-slate-300 dark:bg-slate-600 rounded w-2/5"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface RecordDetailItemProps {
  label: string;
  value: string | number | React.ReactNode;
  icon?: React.ReactElement;
  valueClassName?: string;
  isHighlighted?: boolean;
}

const RecordDetailItemComponent: React.FC<RecordDetailItemProps> = ({ label, value, icon, valueClassName, isHighlighted }) => {
  return (
    <div className={`flex items-center justify-between py-1.5 ${isHighlighted ? 'border-b border-slate-200/70 dark:border-slate-700/50 pb-2.5 mb-1.5' : ''}`}>
      <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
        {icon && React.isValidElement(icon) 
          ? React.cloneElement(icon as React.ReactElement<any>, { size: 15, className: `mr-2 flex-shrink-0 ${isHighlighted ? 'text-indigo-500 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}` })
          : icon}
        <span className={isHighlighted ? 'font-semibold text-slate-600 dark:text-slate-300' : ''}>{label}:</span>
      </div>
      <span className={`text-xs font-semibold text-slate-700 dark:text-slate-200 text-right ${valueClassName}`}>
        {value}
      </span>
    </div>
  );
};

interface RecordCardProps {
  record: SaleRecordWithId;
  onEdit: (record: SaleRecordWithId) => void;
  onDelete: (record: SaleRecordWithId) => void;
}

const RecordCardComponent: React.FC<RecordCardProps> = ({ record, onEdit, onDelete }) => {
  const recordTime = record.created_at 
    ? new Date(record.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
    : formatDate(record.date);

  return (
    <div className="bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-800/80 p-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-200/70 dark:border-slate-700/60 group">
      <div className="flex justify-between items-center mb-3 pb-2.5 border-b border-slate-200/80 dark:border-slate-700/70">
        <div className="flex items-center">
            <ReceiptText size={18} className="mr-2 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-sm text-indigo-700 dark:text-indigo-300">
            ID: <span className="font-mono text-xs tracking-tight">{record.id.substring(0, 8)}</span>
            </h3>
            <span className="text-slate-400 dark:text-slate-500 font-normal text-xs ml-2.5">({recordTime})</span>
        </div>
        <div className="flex space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(record)}
            className="p-1.5 text-sky-600 hover:bg-sky-100 dark:text-sky-400 dark:hover:bg-sky-700/40 rounded-md transition-colors"
            aria-label="Editar registro" title="Editar"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(record)}
            className="p-1.5 text-red-500 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-700/40 rounded-md transition-colors"
            aria-label="Eliminar registro" title="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      <RecordDetailItemComponent
        icon={<TrendingUp />}
        label="Total Venta"
        value={formatCurrency(record.total_ventas_bs, 'VES')}
        valueClassName="!font-extrabold !text-lg text-green-600 dark:text-green-400"
        isHighlighted
      />
      
      <div className="mt-2.5 space-y-0.5">
        <RecordDetailItemComponent icon={<ArrowRightLeft />} label="Tasa Aplicada" value={`${formatCurrency(record.exchange_rate, 'VES').replace(' Bs.','')} Bs./USD`} />
        <RecordDetailItemComponent icon={<DollarSign />} label="Divisas ($) Recibidas" value={formatCurrency(record.usd_received, 'USD')} />
        <RecordDetailItemComponent icon={<Coins />} label="Equivalente Divisas (Bs)" value={formatCurrency(record.calculated_divisas_bs, 'VES')} />
        <RecordDetailItemComponent icon={<Banknote />} label="Efectivo (Bs)" value={formatCurrency(record.efectivo_bs, 'VES')} />
        <RecordDetailItemComponent icon={<CreditCard />} label="Tarjeta (Bs)" value={formatCurrency(record.tarjeta_bs, 'VES')} />
        <RecordDetailItemComponent icon={<Smartphone />} label="Pago Móvil (Bs)" value={formatCurrency(record.pago_movil_bs, 'VES')} />
        <RecordDetailItemComponent 
          icon={<ShoppingCart />} 
          label="Gasto (Bs)" 
          value={formatCurrency(record.gasto_bs, 'VES')} 
          valueClassName="!text-red-500 dark:!text-red-400 !font-bold"
        />
      </div>
    </div>
  );
};


interface SalesHistoryProps {
  userId: string | null;
  isClient: boolean;
  isLoadingInitialDates: boolean; 
  salesHistoryDates: string[];
  selectedHistoryDate: string;
  setSelectedHistoryDate: (date: string) => void;
  recordsForSelectedDate: SaleRecordWithId[];
  isLoadingRecords: boolean; 
  exchangeRateInfo: ExchangeRateInfo;
  onEditRecord: (record: SaleRecordWithId) => void;
  onDeleteRecord: (record: SaleRecordWithId) => void;
  storeName?: string; 
  // logoUrl?: string; // Opcional para el PDF
}

export const SalesHistory: React.FC<SalesHistoryProps> = ({
  userId,
  isClient,
  isLoadingInitialDates,
  salesHistoryDates,
  selectedHistoryDate,
  setSelectedHistoryDate,
  recordsForSelectedDate,
  isLoadingRecords,
  exchangeRateInfo,
  onEditRecord,
  onDeleteRecord,
  storeName = "La Tienda del Blumer.",
  // logoUrl 
}) => {

  const renderContent = () => {
    if (!userId) {
      return <StatusDisplayComponent type="warning" iconSize={24} message={<><span className="font-semibold block mb-0.5">ID de Tienda Requerido</span>No se ha configurado un ID de tienda. El historial no puede cargarse.</>} className="mt-6"/>;
    }
    if (isLoadingInitialDates) {
      return <StatusDisplayComponent type="loading" message="Consultando fechas con registros..." className="mt-6"/>;
    }
    if (salesHistoryDates.length === 0 && !isLoadingInitialDates) {
      return <StatusDisplayComponent 
                type="info" 
                iconSize={24}
                message={<><span className="font-semibold block mb-0.5">Sin Registros Históricos</span>Parece que aún no has guardado ninguna venta. ¡Empieza hoy!</>} 
                className="mt-6 text-center flex-col py-6"
             />;
    }

    return (
      <>
        <div className="my-6 p-4 bg-white dark:bg-slate-800/60 rounded-xl shadow-lg border border-slate-200/60 dark:border-slate-700/50">
            <label htmlFor="historyDate" className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
              <CalendarIcon size={18} className="mr-2 text-indigo-500 dark:text-indigo-400" />
              Seleccionar Fecha del Reporte:
            </label>
            <div className="relative">
              <select 
                id="historyDate" 
                value={selectedHistoryDate} 
                onChange={(e) => setSelectedHistoryDate(e.target.value)}
                disabled={isLoadingRecords || isLoadingInitialDates || salesHistoryDates.length === 0}
                className="w-full appearance-none pl-4 pr-10 py-2.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {salesHistoryDates.length === 0 && <option value="">-- Sin fechas disponibles --</option>}
                {salesHistoryDates.map(histDate => (
                  <option key={histDate} value={histDate}>{formatDate(histDate)}</option>
                ))}
              </select>
              <ChevronDown size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
            </div>
        </div>

        {isClient && selectedHistoryDate && recordsForSelectedDate.length > 0 && !isLoadingRecords && (
          <PDFDownloadLink
            document={
              <SalesReportPDFDocument
                reportDate={selectedHistoryDate}
                records={recordsForSelectedDate}
                exchangeRateInfo={exchangeRateInfo}
                storeName={storeName}
                // logoUrl={logoUrl}
              />
            }
            fileName={`Reporte_Ventas_${storeName.replace(/\s+/g, '_')}_${selectedHistoryDate}.pdf`}
            className="w-full group mb-6 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-semibold py-3 px-5 rounded-lg shadow-md hover:shadow-lg flex items-center justify-center disabled:opacity-60 transition-all duration-200 ease-in-out transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-900 focus-visible:ring-teal-400"
          >
            {({ loading: pdfLoading }) =>
              pdfLoading ? (
                <> <Loader2 size={19} className="mr-2.5 animate-spin" /> Generando PDF...</>
              ) : (
                <> <FileText size={18} className="mr-2.5 group-hover:animate-pulse" /> Descargar Reporte PDF ({formatDate(selectedHistoryDate)}) <ExternalLink size={14} className="ml-2 opacity-70 group-hover:opacity-100" /> </>
              )
            }
          </PDFDownloadLink>
        )}
         {isClient && selectedHistoryDate && recordsForSelectedDate.length === 0 && !isLoadingRecords && (
             <StatusDisplayComponent type="info" message={<>No hay registros para generar un PDF de la fecha <span className="font-semibold">{formatDate(selectedHistoryDate)}</span>.</>} className="mb-6"/>
         )}

        {isLoadingRecords && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[...Array(isLoadingInitialDates ? 1 : 2)].map((_, i) => <SkeletonCardComponent key={i} />)}
          </div>
        )}

        {!isLoadingRecords && recordsForSelectedDate.length === 0 && selectedHistoryDate && salesHistoryDates.length > 0 && (
          <StatusDisplayComponent 
            type="info"
            iconSize={24}
            message={<><span className="font-semibold block mb-0.5">Sin Transacciones</span>No se encontraron registros para la fecha <span className="font-bold">{formatDate(selectedHistoryDate)}</span>.</>} 
            className="text-center flex-col py-6"
          />
        )}
        
        {!isLoadingRecords && recordsForSelectedDate.length > 0 && (
          <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-2 -mr-2 custom-scrollbar-pretty"> 
            {recordsForSelectedDate.map(record => (
              <RecordCardComponent 
                key={record.id || record.created_at} 
                record={record}
                onEdit={onEditRecord}
                onDelete={onDeleteRecord}
              />
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="p-4 sm:p-6 bg-slate-100 dark:bg-slate-900 rounded-2xl shadow-2xl mt-8 lg:mt-0 border border-slate-200/80 dark:border-slate-700/70 min-h-[400px]">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center">
            <span className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg mr-4">
                <ListFilter size={24} className="text-white"/>
            </span>
            <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-slate-50"> Historial de Ventas</h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Consulta, gestiona y exporta tus registros de ventas.</p>
            </div>
        </div>
        {isClient && exchangeRateInfo && !exchangeRateInfo.isError && (
             <div className="hidden md:flex items-center text-xs text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-3 py-1.5 rounded-lg shadow-sm" title={`Última actualización BCV: ${formatDate(exchangeRateInfo.lastUpdate, 'dd/mm/yy')}`}>
                <RefreshCcw size={13} className="mr-1.5 text-sky-500" />
                BCV: <span className="font-semibold text-slate-700 dark:text-slate-200 ml-1">{formatCurrency(exchangeRateInfo.rate, 'VES')}</span>
            </div>
        )}
      </div>
      <hr className="my-4 sm:my-5 border-slate-200 dark:border-slate-700/80"/>
      
      {renderContent()}
    </div>
  );
};

// Estilos para un scrollbar más estético (opcional, añadir a tu CSS global)
/*
.custom-scrollbar-pretty::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.custom-scrollbar-pretty::-webkit-scrollbar-track {
  background: rgba(203, 213, 225, 0.1); // slate-300 con transparencia
  border-radius: 10px;
}
.dark .custom-scrollbar-pretty::-webkit-scrollbar-track {
  background: rgba(71, 85, 105, 0.1); // slate-600 con transparencia
}
.custom-scrollbar-pretty::-webkit-scrollbar-thumb {
  background-color: #94a3b8; // slate-400
  border-radius: 10px;
  border: 2px solid transparent;
  background-clip: content-box;
}
.dark .custom-scrollbar-pretty::-webkit-scrollbar-thumb {
  background-color: #4b5563; // slate-600
}
.custom-scrollbar-pretty::-webkit-scrollbar-thumb:hover {
  background-color: #64748b; // slate-500
}
.dark .custom-scrollbar-pretty::-webkit-scrollbar-thumb:hover {
  background-color: #334155; // slate-700
}
.custom-scrollbar-pretty {
  scrollbar-width: thin;
  scrollbar-color: #94a3b8 rgba(203, 213, 225, 0.1); // thumb track - Para Firefox
}
.dark .custom-scrollbar-pretty {
  scrollbar-color: #4b5563 rgba(71, 85, 105, 0.1); // thumb track - Para Firefox
}
*/
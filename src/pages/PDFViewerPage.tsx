import React from 'react';
import ReactPDF, {
    usePDF,
    Image,
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    PDFViewer
} from '@react-pdf/renderer';

// Estilos para el PDF
const styles = StyleSheet.create({
    page: {
        flexDirection: 'row',
        backgroundColor: '#E4E4E4',
    },
    section: {
        margin: 10,
        padding: 10,
        flexGrow: 1,
    },
    image: {
        width: "90px",
        height: "90px",
        objectFit: "center",
        margin: 5
    },
    text: {
        fontFamily: 'Helvetica',
    },
});

const LaborOrderDoc = () => {
    return (
        <Document title='QTS Agro'>
            <Page size="A4" style={styles.page}>
                <View style={styles.image}>
                    <Image src={"/assets/images/logos/agrootolss_logo_sol.png"} />
                </View>
                <View style={styles.section}>
                    <Text style={styles.text}>Orden Retiro Nro 3</Text>
                </View>
                <View style={styles.section}>
                    <Text style={styles.text}>Este es un PDF generado desde React.</Text>
                </View>
            </Page>
        </Document>
    )
}

export const PDFViewerPage: React.FC = () => {
    return (
        <PDFViewer style={{ width: '100%', height: '100%' }}>
            <LaborOrderDoc />
        </PDFViewer>
    )
}

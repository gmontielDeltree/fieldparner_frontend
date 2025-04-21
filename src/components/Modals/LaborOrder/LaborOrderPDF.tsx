import React from 'react';
import {
    usePDF,
    Image,
    Document,
    Page,
    Text,
    View,
    StyleSheet
} from '@react-pdf/renderer';
import { DepositSupplyOrderItem, TipoEntidad, WithdrawalOrder } from '../../../types';

// PDF styles
const styles = StyleSheet.create({
    body: {
        paddingTop: 35,
        paddingBottom: 65,
        paddingHorizontal: 30
    },
    subtitle: {
        fontSize: 18,
        margin: 12,
        fontFamily: 'Helvetica'
    },
    text: {
        margin: 12,
        fontSize: 18,
        textAlign: 'justify',
        fontFamily: 'Courier-Bold'
    },
    textDetail: {
        margin: 12,
        fontSize: 14,
        textAlign: 'justify',
        fontFamily: 'Courier-Bold'
    },
    textBody: {
        margin: 12,
        fontSize: 14,
        textAlign: 'justify',
        fontFamily: 'Times-Roman'
    },
    page: {
        display: "flex",
        flexDirection: 'row',
        backgroundColor: '#E4E4E4'
    },
    header: {
        display: "flex",
        flexDirection: "row",
        width: "100%",
        height: "90px"
    },
    section: {
        margin: 1
    },
    image: {
        width: "30px",
        height: "30px"
    },
    titleImage: {
        fontFamily: 'Helvetica',
        fontSize: 22,
        color: "#71d076",
        textAlign: "center",
        letterSpacing: "3px",
        marginLeft: 5
    },
    titlePrincipal: {
        marginTop: 25,
        fontFamily: 'Courier',
        fontSize: 24,
        textAlign: "center"
    }
});

interface LaborOrderDocProps {
    withdrawalOrder: WithdrawalOrder;
    depositAndSupplies: DepositSupplyOrderItem[];
}

// PDF Document component
const LaborOrderDoc = ({ withdrawalOrder, depositAndSupplies }: LaborOrderDocProps) => {
    const contractor = withdrawalOrder.contractor;
    let contractorName = "";

    if (contractor) {
        contractorName =
            contractor.tipoEntidad === TipoEntidad.FISICA
                ? contractor.nombreCompleto || contractor.nombre || ""
                : contractor.razonSocial || contractor.nombre || "";
    }

    return (
        <Document title="QTS Agro">
            <Page size="A3" style={styles.body}>
                <View style={styles.header}>
                    <Image style={styles.image} src="/assets/images/logos/agrootolss_logo_sol.png" />
                    <Text style={styles.titleImage}>QTS Agro</Text>
                    <Text style={styles.titlePrincipal}>
                        Orden Retiro Nro: {withdrawalOrder.order}
                    </Text>
                </View>
                <View style={styles.section}>
                    <Text style={styles.text}>
                        Fecha: <Text style={styles.textBody}>{withdrawalOrder.creationDate}</Text> - Contratista:{" "}
                        <Text style={styles.textBody}>{contractorName || "No especificado"}</Text> - Labor:{" "}
                        <Text style={styles.textBody}>{withdrawalOrder.labor?.toUpperCase()}</Text>
                    </Text>
                </View>
                {depositAndSupplies.map((x) => (
                    <div key={x._id || `${x.deposit.description}-${x.supply.name}`}>
                        <View style={styles.section}>
                            <Text style={styles.textDetail}>
                                Deposito:
                                <Text style={styles.textBody}> {x.deposit.description}</Text>
                                {"  "}Insumo:
                                <Text style={styles.textBody}> {x.supply.name}</Text>{"  "}
                                UM:
                                <Text style={styles.textBody}> {x.supply.unitMeasurement}</Text>{"  "}
                                Cantidad a Retirar:
                                <Text style={styles.textBody}> {x.amount}</Text>
                            </Text>
                        </View>
                        <View style={{ width: "100%", borderBottom: "1px solid black" }} />
                    </div>
                ))}
            </Page>
        </Document>
    );
};

/**
 * Hook para generar el PDF de una orden de retiro
 * @param withdrawalOrder Orden de retiro
 * @param depositAndSupplies Lista de insumos a retirar
 * @returns Un objeto con la URL del PDF y una función para actualizarlo
 */
export const useLaborOrderPDF = (
    withdrawalOrder: WithdrawalOrder | null,
    depositAndSupplies: DepositSupplyOrderItem[]
) => {
    // Si no hay orden activa o no hay insumos, devolvemos un documento vacío
    const docComponent = (withdrawalOrder && depositAndSupplies.length)
        ? <LaborOrderDoc withdrawalOrder={withdrawalOrder} depositAndSupplies={depositAndSupplies} />
        : <></>;

    // Generamos el PDF usando el hook usePDF
    const [instance, updateInstance] = usePDF({ document: docComponent });

    return {
        pdfInstance: instance,
        updatePDF: updateInstance
    };
};

export default LaborOrderDoc;
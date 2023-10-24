import React, { useEffect, useState } from 'react';
import PouchDB from 'pouchdb';
// import pouchdbFind from 'pouchdb-find';
// import pouchdbAuthentication from 'pouchdb-authentication';


// PouchDB.plugin(pouchdbFind);
// PouchDB.plugin(pouchdbAuthentication);

// //Connect DB
// const db = new PouchDB('http://localhost:5984/nombre_de_la_base_de_datos');

export interface PouchDBComponentProps {
    children: React.ReactNode;
}


const PouchDBComponent: React.FC<PouchDBComponentProps> = ({ children }) => {
    const [data, setData] = useState<any>([]);

    useEffect(() => {
        const db = new PouchDB('Vehiculos-test');
        console.log('Conectando POUCH DB');

        // Función para obtener todos los documentos de la base de datos
        const getAllDocuments = async () => {
            try {
                const result = await db.allDocs({ include_docs: true });
                const documents = result.rows.map(row => row.doc);

                console.log('documents', documents);
                if (documents) setData(documents);

            } catch (error) {
                console.error('Error al conectar con DB:', error);
            }
        };

        // Llamada a la función para obtener los documentos al montar el componente
        getAllDocuments();

        return () => {
            // Cierre de la conexión con la base de datos al desmontar el componente
            db.close();
        };
    }, []);

    return (
        <>
            <div>
                <h2>PouchDBComponent</h2>
                <ul>
                    {data.map((doc: any) => (
                        <li key={doc._id}>{doc.title}</li>
                    ))}
                </ul>
            </div>
            {
                children
            }
        </>
    );
};

export default PouchDBComponent;

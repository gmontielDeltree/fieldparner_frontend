import { Actividad } from '../../depositos/depositos-types';
import jsreport from '@jsreport/browser-client'


export const openReportOrdenTrabajo = async (r: Actividad) => {

	jsreport.serverUrl = import.meta.env.VITE_REPORTS_URL
	jsreport.headers['Authorization'] = "Basic " + btoa(import.meta.env.VITE_REPORTS_CRED)

	const report = await jsreport.render({
		template: {
			name: '/Invoice/invoice-main'
		},
		data: r,
	})

	report.openInWindow({ title: r._id })

}
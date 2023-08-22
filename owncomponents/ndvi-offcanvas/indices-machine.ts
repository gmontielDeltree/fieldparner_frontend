import { Machine, MachineConfig, createMachine } from 'xstate';
import { Feature, FeatureCollection, feature, featureCollection } from '@turf/helpers';

interface IndicesMachineContext {
	featureCollection : FeatureCollection | undefined,
	selectedFeature : Feature | undefined
}

export const indices_machine  = createMachine<IndicesMachineContext>({
	id:"indices",
	context: {featureCollection:featureCollection([]),selectedFeature:undefined},
	states:{
		
	}
})
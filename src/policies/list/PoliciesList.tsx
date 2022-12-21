import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  NodeNetworkConfigurationEnactmentModelGroupVersionKind,
  NodeNetworkConfigurationPolicyModelGroupVersionKind,
  NodeNetworkConfigurationPolicyModelRef,
} from 'src/console-models';
import { ENACTMENT_LABEL_POLICY } from 'src/utils/constants';
import { useNMStateTranslation } from 'src/utils/hooks/useNMStateTranslation';

import {
  ListPageBody,
  ListPageCreateDropdown,
  ListPageHeader,
  useK8sWatchResource,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import { V1beta1NodeNetworkConfigurationEnactment, V1NodeNetworkConfigurationPolicy } from '@types';

import PolicyEnactmentsDrawer from './components/PolicyEnactmentsDrawer/PolicyEnactmentsDrawer';
import PolicyRow from './components/PolicyRow';
import usePolicyColumns from './hooks/usePolicyColumns';

const PoliciesList: React.FC = () => {
  const { t } = useNMStateTranslation();
  const history = useHistory();
  const [selectedPolicy, setSelectedPolicy] = useState<V1NodeNetworkConfigurationPolicy>();

  const [policies, policiesLoaded, policiesLoadError] = useK8sWatchResource<
    V1NodeNetworkConfigurationPolicy[]
  >({
    groupVersionKind: NodeNetworkConfigurationPolicyModelGroupVersionKind,
    isList: true,
    namespaced: false,
  });

  const [enactments, enactmentsLoaded, enactmentsError] = useK8sWatchResource<
    V1beta1NodeNetworkConfigurationEnactment[]
  >({
    groupVersionKind: NodeNetworkConfigurationEnactmentModelGroupVersionKind,
    isList: true,
  });

  const createItems = {
    catalog: t('From Form'),
    yaml: t('With YAML'),
  };

  const onCreate = (type: string) => {
    return type === 'catalog'
      ? history.push(`/k8s/cluster/${NodeNetworkConfigurationPolicyModelRef}/~new/form`)
      : history.push(`/k8s/cluster/${NodeNetworkConfigurationPolicyModelRef}/~new/yaml`);
  };

  const [, activeColumns] = usePolicyColumns();

  const selectedPolicyEnactments = selectedPolicy
    ? enactments.filter(
        (enactment) =>
          enactment?.metadata?.labels?.[ENACTMENT_LABEL_POLICY] === selectedPolicy?.metadata?.name,
      )
    : [];

  return (
    <>
      <ListPageHeader title={t('Node Network Configuration Policy')}>
        <ListPageCreateDropdown
          items={createItems}
          onClick={onCreate}
          createAccessReview={{
            groupVersionKind: NodeNetworkConfigurationPolicyModelRef,
          }}
        >
          {t('Create')}
        </ListPageCreateDropdown>
      </ListPageHeader>
      <ListPageBody>
        <VirtualizedTable<V1NodeNetworkConfigurationPolicy>
          data={policies}
          unfilteredData={policies}
          loaded={policiesLoaded && enactmentsLoaded}
          columns={activeColumns}
          loadError={policiesLoadError && enactmentsError}
          Row={PolicyRow}
          rowData={{ selectPolicy: setSelectedPolicy, enactments }}
        />

        <PolicyEnactmentsDrawer
          selectedPolicy={selectedPolicy}
          onClose={() => setSelectedPolicy(undefined)}
          enactments={selectedPolicyEnactments}
        />
      </ListPageBody>
    </>
  );
};

export default PoliciesList;
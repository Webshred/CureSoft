
import React from 'react';
import PageLayout from '../components/layout/PageLayout';
import PageHeader from '../components/layout/PageHeader';
import Billing from '../components/Billing';
import { Receipt } from 'lucide-react';
import usePageMetadata from '../hooks/use-page-metadata';

const BillingPage = () => {
  const { 
    title, 
    description, 
    handleTitleChange, 
    handleDescriptionChange 
  } = usePageMetadata({
    defaultTitle: 'Billing',
    defaultDescription: 'Create and manage patient invoices'
  });

  return (
    <PageLayout>
      <div className="p-6 animate-enter">
        <PageHeader 
          title={title}
          description={description}
          onTitleChange={handleTitleChange}
          onDescriptionChange={handleDescriptionChange}
          icon={<Receipt className="h-6 w-6" />}
          showEditIcon={false}
        />

        <Billing />
      </div>
    </PageLayout>
  );
};

export default BillingPage;

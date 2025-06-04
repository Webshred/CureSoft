
import React, { useState, useRef } from 'react';
import PageLayout from '../components/layout/PageLayout';
import PageHeader from '../components/layout/PageHeader';
import Inventory from '../components/Inventory';
import { Button } from '../components/ui/button';
import { Package } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import usePageMetadata from '../hooks/use-page-metadata';
import { motion } from 'framer-motion';

const InventoryPage = () => {
  const { toast: shadowToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { 
    title, 
    description, 
    handleTitleChange, 
    handleDescriptionChange 
  } = usePageMetadata({
    defaultTitle: 'Inventory Management',
    defaultDescription: 'Manage your inventory and track stock levels'
  });

  return (
    <PageLayout>
      <div className="p-6 animate-enter">
        <PageHeader 
          title={title}
          description={description}
          onTitleChange={handleTitleChange}
          onDescriptionChange={handleDescriptionChange}
          icon={<Package className="h-6 w-6" />}
          showEditIcon={false}
        />

        <Inventory />
      </div>
    </PageLayout>
  );
};

export default InventoryPage;

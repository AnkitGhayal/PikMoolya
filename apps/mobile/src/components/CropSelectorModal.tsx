import React from 'react';
import { SelectionBottomSheet, SelectionOption } from './SelectionBottomSheet';

export type CropItem = {
  id: string;
  name: string;
  variety?: string;
  unit?: string;
};

interface CropSelectorModalProps {
  visible: boolean;
  crops: CropItem[];
  selectedCropId?: string;
  onSelectCrop: (crop: CropItem) => void;
  onClose: () => void;
}

export const CropSelectorModal: React.FC<CropSelectorModalProps> = ({
  visible,
  crops,
  selectedCropId,
  onSelectCrop,
  onClose,
}) => {
  const options: SelectionOption[] = crops.map((crop) => ({
    id: crop.id,
    label: crop.name,
    subLabel: crop.variety ? `Variety: ${crop.variety}` : undefined,
    icon: 'leaf',
    value: crop,
  }));

  return (
    <SelectionBottomSheet
      visible={visible}
      title="Select Crop"
      subtitle="Choose the agricultural produce you are selling"
      icon="leaf-outline"
      options={options}
      selectedValue={selectedCropId}
      searchable={true}
      searchPlaceholder="Search crop by name or variety..."
      onSelect={(opt) => onSelectCrop(opt.value)}
      onClose={onClose}
    />
  );
};

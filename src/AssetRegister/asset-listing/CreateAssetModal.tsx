import React, { useState } from "react";
import { Button, Input, Modal, Select } from "../Components/primitive";
import { useAssetCategories, useCreateAsset } from "../Components/assetHooks";

interface CreateAssetModalProps {
  open: boolean;
  onClose: () => void;
  unitType: string;
}

const CreateAssetModal: React.FC<CreateAssetModalProps> = ({
  open,
  onClose,
  unitType,
}) => {
  const { data: categories } = useAssetCategories(unitType);
  const create = useCreateAsset(unitType);

  const [categoryId, setCategoryId] = useState("");
  const [assetTag, setAssetTag] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [acquisitionDate, setAcquisitionDate] = useState("");
  const [cost, setCost] = useState("0");
  const [residualValue, setResidualValue] = useState("0");

  const handleSubmit = () => {
    create.mutate(
      {
        categoryId,
        assetTag,
        name,
        location: location || null,
        acquisitionDate: acquisitionDate || null,
        cost: Number(cost || 0),
        residualValue: Number(residualValue || 0),
        unitType
      } as any,
      {
        onSuccess: () => {
          // Reset form on success
          setCategoryId("");
          setAssetTag("");
          setName("");
          setLocation("");
          setAcquisitionDate("");
          setCost("0");
          setResidualValue("0");
          onClose();
        },
      }
    );
  };

  return (
    <Modal
      open={open}
      title="Create New Asset"
      onClose={onClose}
      maxWidth="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={create.isPending || !categoryId || !assetTag || !name}
            onClick={handleSubmit}
          >
            {create.isPending ? "Creating…" : "Create Asset"}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-600 uppercase tracking-wider">
            Category
          </label>
          <Select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Select category...</option>
            {categories?.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-600 uppercase tracking-wider">
            Asset Tag
          </label>
          <Input
            value={assetTag}
            onChange={(e) => setAssetTag(e.target.value)}
            placeholder="e.g. ICT-000123"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1.5 block text-xs font-bold text-slate-600 uppercase tracking-wider">
            Asset Name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. HP LaserJet Printer"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-600 uppercase tracking-wider">
            Acquisition Date
          </label>
          <Input
            type="date"
            value={acquisitionDate}
            onChange={(e) => setAcquisitionDate(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-600 uppercase tracking-wider">
            Location
          </label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. HQ Store"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-600 uppercase tracking-wider">
            Cost
          </label>
          <Input
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-600 uppercase tracking-wider">
            Residual Value
          </label>
          <Input
            type="number"
            value={residualValue}
            onChange={(e) => setResidualValue(e.target.value)}
          />
        </div>

        {create.isError && (
          <div className="md:col-span-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <p className="font-semibold text-rose-800">Registration failed</p>
            <p className="mt-1">{String((create.error as any)?.message || create.error)}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CreateAssetModal;

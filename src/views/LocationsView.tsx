/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  MapPin,
  Plus,
  Boxes,
  Layers,
  Archive,
  ChevronDown,
  ChevronLeft,
  Search,
  AlertCircle
} from 'lucide-react';
import { Warehouse, Shelf, LocationSpot } from '../types';

export const LocationsView: React.FC = () => {
  const { warehouses, items, addWarehouse, addShelf, addSpot } = useApp();

  const [newWarehouseName, setNewWarehouseName] = useState('');
  const [newWarehouseCode, setNewWarehouseCode] = useState('');
  const [isAddingWarehouse, setIsAddingWarehouse] = useState(false);

  const [addingShelfToWhId, setAddingShelfToWhId] = useState<string | null>(null);
  const [newShelfName, setNewShelfName] = useState('');

  const [addingSpotShelfId, setAddingSpotShelfId] = useState<string | null>(null);
  const [addingSpotWhId, setAddingSpotWhId] = useState<string | null>(null);
  const [newSpotName, setNewSpotName] = useState('');

  const [selectedSpot, setSelectedSpot] = useState<LocationSpot | null>(null);

  // Find all items stored in a spot
  const getItemsInSpot = (spotId: string) => {
    return items.filter((item) => item.locations.some((loc) => loc.locationId === spotId));
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-purple-950">
              إدارة المواقع ومستويات التخزين (Storage Locations)
            </h1>
            <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {warehouses.length} مستودعات رئيسية
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            هيكل هرمي ثلاثي المستويات: المستودع ← الرف ← الخانة التخزينية؛ لسرعة الوصول لأي قطعة في أقل من دقيقتين
          </p>
        </div>

        <button
          onClick={() => setIsAddingWarehouse(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-sm shadow-md transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>إضافة مستودع رئيسي</span>
        </button>
      </div>

      {/* Add Warehouse Modal/Form */}
      {isAddingWarehouse && (
        <div className="bg-purple-50/70 p-5 rounded-3xl border border-purple-200 animate-in fade-in space-y-3">
          <h3 className="text-sm font-black text-purple-950">إضافة مستودع جديد</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-purple-900 block mb-1">اسم المستودع</label>
              <input
                type="text"
                value={newWarehouseName}
                onChange={(e) => setNewWarehouseName(e.target.value)}
                placeholder="مثال: مستودع الصيانة الكهربائية"
                className="w-full p-2.5 rounded-xl border border-purple-200 bg-white text-xs font-bold focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-purple-900 block mb-1">كود المستودع</label>
              <input
                type="text"
                value={newWarehouseCode}
                onChange={(e) => setNewWarehouseCode(e.target.value)}
                placeholder="مثال: WH-ELEC"
                className="w-full p-2.5 rounded-xl border border-purple-200 bg-white text-xs font-mono font-bold focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsAddingWarehouse(false)}
              className="px-4 py-1.5 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold"
            >
              إلغاء
            </button>
            <button
              onClick={() => {
                if (newWarehouseName && newWarehouseCode) {
                  addWarehouse(newWarehouseName, newWarehouseCode);
                  setNewWarehouseName('');
                  setNewWarehouseCode('');
                  setIsAddingWarehouse(false);
                }
              }}
              className="px-5 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow"
            >
              حفظ المستودع
            </button>
          </div>
        </div>
      )}

      {/* Warehouses Hierarchy Cards */}
      <div className="space-y-6">
        {warehouses.map((wh) => (
          <div key={wh.id} className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden">
            
            {/* Warehouse Header */}
            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-purple-700/60 ring-2 ring-purple-400/30">
                  <Archive className="h-6 w-6 text-purple-200" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black">{wh.name}</h2>
                    <span className="font-mono text-xs bg-purple-800/80 px-2 py-0.5 rounded border border-purple-600/50">
                      {wh.code}
                    </span>
                  </div>
                  <p className="text-xs text-purple-200 mt-0.5">
                    يحتوي على {wh.shelves.length} رفوف تخزينية
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setAddingShelfToWhId(wh.id);
                  setNewShelfName('');
                }}
                className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-purple-700/80 hover:bg-purple-600 text-purple-100 text-xs font-bold border border-purple-500/50 shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>إضافة رف جديد</span>
              </button>
            </div>

            {/* Add Shelf Form */}
            {addingShelfToWhId === wh.id && (
              <div className="bg-purple-50 p-4 border-b border-purple-100 flex items-center gap-3">
                <input
                  type="text"
                  value={newShelfName}
                  onChange={(e) => setNewShelfName(e.target.value)}
                  placeholder="اسم الرف، مثل: رف المحركات C-02"
                  className="flex-1 p-2 rounded-xl bg-white border border-purple-200 text-xs font-bold"
                />
                <button
                  onClick={() => {
                    if (newShelfName) {
                      addShelf(wh.id, newShelfName);
                      setAddingShelfToWhId(null);
                      setNewShelfName('');
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-700 text-white font-bold text-xs"
                >
                  إضافة
                </button>
                <button
                  onClick={() => setAddingShelfToWhId(null)}
                  className="px-3 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs"
                >
                  إلغاء
                </button>
              </div>
            )}

            {/* Shelves & Spots Body */}
            <div className="p-6 space-y-6">
              {wh.shelves.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-purple-200 rounded-2xl">
                  لا توجد رفوف مسجلة في هذا المستودع بعد. انقر على &quot;إضافة رف جديد&quot; للبدء.
                </div>
              ) : (
                wh.shelves.map((shelf) => (
                  <div key={shelf.id} className="bg-purple-50/30 rounded-2xl p-4 border border-purple-100 space-y-3">
                    
                    <div className="flex items-center justify-between border-b border-purple-100/80 pb-2">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-purple-700" />
                        <h3 className="font-black text-sm text-purple-950">{shelf.name}</h3>
                        <span className="text-[11px] text-slate-500 font-semibold">
                          ({shelf.spots.length} خانة / موضع)
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setAddingSpotWhId(wh.id);
                          setAddingSpotShelfId(shelf.id);
                          setNewSpotName('');
                        }}
                        className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        <span>إضافة خانة</span>
                      </button>
                    </div>

                    {/* Add Spot Inline */}
                    {addingSpotShelfId === shelf.id && addingSpotWhId === wh.id && (
                      <div className="p-3 bg-white rounded-xl border border-purple-200 flex items-center gap-2">
                        <input
                          type="text"
                          value={newSpotName}
                          onChange={(e) => setNewSpotName(e.target.value)}
                          placeholder="اسم الخانة، مثل: خانة 04"
                          className="flex-1 p-1.5 rounded-lg border border-purple-200 text-xs font-bold"
                        />
                        <button
                          onClick={() => {
                            if (newSpotName) {
                              addSpot(wh.id, shelf.id, newSpotName);
                              setAddingSpotShelfId(null);
                              setNewSpotName('');
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-purple-700 text-white font-bold text-xs"
                        >
                          حفظ الخانة
                        </button>
                        <button
                          onClick={() => setAddingSpotShelfId(null)}
                          className="px-2 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-xs"
                        >
                          إلغاء
                        </button>
                      </div>
                    )}

                    {/* Spots Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {shelf.spots.map((spot) => {
                        const itemsInSpot = getItemsInSpot(spot.id);
                        const totalUnits = itemsInSpot.reduce((acc, itm) => {
                          const loc = itm.locations.find((l) => l.locationId === spot.id);
                          return acc + (loc ? loc.quantity : 0);
                        }, 0);

                        return (
                          <div
                            key={spot.id}
                            onClick={() => setSelectedSpot(spot)}
                            className="bg-white p-3.5 rounded-xl border border-purple-100 hover:border-purple-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-bold text-xs text-purple-950 group-hover:text-purple-700 flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-purple-500" />
                                {spot.name}
                              </span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                                itemsInSpot.length > 0 ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-400'
                              }`}>
                                {itemsInSpot.length} أصناف
                              </span>
                            </div>

                            <p className="text-[10px] text-slate-400 font-mono truncate">{spot.fullPath}</p>

                            <div className="mt-2 text-right">
                              <span className="text-[11px] font-bold text-slate-700">
                                إجمالي القطع: <span className="text-purple-700 font-mono">{totalUnits}</span>
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                ))
              )}
            </div>

          </div>
        ))}
      </div>

      {/* Spot Details Drawer Modal */}
      {selectedSpot && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedSpot(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-purple-100 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-purple-100 pb-3">
              <div>
                <span className="text-[11px] font-mono text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded">
                  {selectedSpot.fullPath}
                </span>
                <h3 className="text-base font-black text-purple-950 mt-1">
                  محتويات الخانة التخزينية: {selectedSpot.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSpot(null)}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* List of items inside this spot */}
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {getItemsInSpot(selectedSpot.id).length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  هذه الخانة فارغة حالياً ولا تحتوي على قطع غيار مسجلة
                </div>
              ) : (
                getItemsInSpot(selectedSpot.id).map((itm) => {
                  const locBalance = itm.locations.find((l) => l.locationId === selectedSpot.id);
                  return (
                    <div
                      key={itm.id}
                      className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">{itm.name}</span>
                        <span className="text-[10px] font-mono text-purple-700">{itm.code}</span>
                      </div>
                      <span className="font-mono font-bold text-purple-950 text-sm">
                        {locBalance?.quantity || 0} {itm.unitName}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-3 border-t border-purple-100 flex justify-end">
              <button
                onClick={() => setSelectedSpot(null)}
                className="px-5 py-2 rounded-xl bg-purple-700 text-white font-bold text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Plus } from 'lucide-react';
import type { PantryItem } from '../App';

type SmartPantryProps = {
  pantryItems: PantryItem[];
  onAddItem: (item: Omit<PantryItem, 'id'>) => void;
};

export function SmartPantry({ pantryItems, onAddItem }: SmartPantryProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');

  const handleAddItem = () => {
    if (newItemName.trim() && newItemQuantity.trim()) {
      onAddItem({
        name: newItemName.trim(),
        quantity: newItemQuantity.trim(),
      });
      setNewItemName('');
      setNewItemQuantity('');
      setShowAddDialog(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-gray-900 text-3xl font-bold">Smart Pantry</h1>
        <Button onClick={() => setShowAddDialog(true)} className="bg-orange-600 hover:bg-orange-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Items
        </Button>
      </div>

      {/* Pantry Items List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {pantryItems
          // FIX: Filter out items that have no name (ghost items)
          .filter(item => item.name && item.name.trim() !== '') 
          .map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <h3 className="text-gray-900 font-medium mb-1">{item.name}</h3>
                <p className="text-gray-600 text-sm bg-gray-100 inline-block px-2 py-1 rounded">{item.quantity}</p>
              </CardContent>
            </Card>
        ))}
      </div>

      {pantryItems.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">Your pantry is empty. Start adding ingredients!</p>
          <Button variant="outline" onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Item
          </Button>
        </div>
      )}

      {/* Add Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Pantry Items</DialogTitle>
            <DialogDescription>
              Add new ingredients to your pantry. Be specific with quantities (e.g., "2 lbs", "5 units").
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="item-name">Ingredient Name</Label>
              <Input
                id="item-name"
                placeholder="e.g., Chicken Breast"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="item-quantity">Quantity (Number + Unit)</Label>
              <Input
                id="item-quantity"
                placeholder="e.g., 2 lbs, 12 count, 500 grams"
                value={newItemQuantity}
                onChange={(e) => setNewItemQuantity(e.target.value)}
                className="mt-2"
              />
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  setNewItemName('');
                  setNewItemQuantity('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddItem}
                disabled={!newItemName.trim() || !newItemQuantity.trim()}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                Add Item
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
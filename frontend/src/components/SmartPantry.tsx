import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Plus, ShoppingCart } from 'lucide-react';
import type { PantryItem, ShoppingListItem } from '../App';
// NOTE: Switch is not needed anymore if using separate buttons

type SmartPantryProps = {
  pantryItems: PantryItem[];
  onAddItem: (item: Omit<PantryItem, 'id'>) => void;
  shoppingListItems: ShoppingListItem[];
  onAddShoppingItem: (item: Omit<ShoppingListItem, 'id'>) => void;
};

export function SmartPantry({ pantryItems, onAddItem, shoppingListItems, onAddShoppingItem }: SmartPantryProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');

  // NEW STATE: Tracks if the current modal target is the Shopping List
  const [isShoppingListTarget, setIsShoppingListTarget] = useState(false);

  const openAddDialog = (isShoppingList: boolean) => {
    setIsShoppingListTarget(isShoppingList);
    setNewItemName('');
    setNewItemQuantity('');
    setShowAddDialog(true);
  };

  const handleCloseDialog = () => {
    setShowAddDialog(false);
    setNewItemName('');
    setNewItemQuantity('');
    setIsShoppingListTarget(false);
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) return;

    if (isShoppingListTarget) {
      if (!newItemQuantity.trim()) {
        alert("Items require a quantity.");
        return;
      }
      onAddShoppingItem({ name: newItemName.trim(), quantity: newItemQuantity.trim() });
    } else {
      // Pantry: Requires name AND quantity
      if (!newItemQuantity.trim()) {
        alert("Pantry items require a quantity.");
        return;
      }
      onAddItem({
        name: newItemName.trim(),
        quantity: newItemQuantity.trim()
      });
    }

    handleCloseDialog();
  };

  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* --- Smart Pantry Section --- */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-gray-900 text-3xl font-bold">Smart Pantry Inventory</h1>
          {/* DEDICATED BUTTON for Pantry */}
          <Button onClick={() => openAddDialog(false)} className="bg-orange-600 hover:bg-orange-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add to Pantry
          </Button>
        </div>

        {/* Pantry Items List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {pantryItems
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
            <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300 mt-4">
              <p className="text-gray-500 mb-4">Your pantry is empty. Start adding ingredients!</p>
              <Button variant="outline" onClick={() => openAddDialog(false)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Item
              </Button>
            </div>
        )}

        {/* --- Shopping List Section --- */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-gray-900 text-3xl font-bold">Shopping List</h1>
            {/* DEDICATED BUTTON for Shopping List */}
            <Button
                onClick={() => openAddDialog(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2"/>
              Add to List
            </Button>
          </div>

          {/* Shopping List Items */}
          {shoppingListItems && shoppingListItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {shoppingListItems.filter(item => item.name && item.name.trim() !== '') .map((item) => (
                    <Card key={item.id} className="bg-orange-50 border-orange-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <h3 className="text-gray-900 font-medium">{item.name}</h3>
                        <p className="text-gray-600 text-sm">{item.quantity}</p>
                      </CardContent>
                    </Card>
                ))}
              </div>
          ) : (
              <div className="text-center py-8 bg-white rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">Your shopping list is empty!</p>
              </div>
          )}
        </div>

        <hr className="my-10" />

        {/* CONSOLIDATED Add Item Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isShoppingListTarget ? "Add to Shopping List" : "Add to Smart Pantry"}</DialogTitle>
              <DialogDescription>
                {isShoppingListTarget
                    ? "Enter the name of the item you need to buy."
                    : "Add new ingredients to your pantry. Be specific with quantities."
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">

              {/* Ingredient Name Input */}
              <div>
                <Label htmlFor="item-name">Ingredient Name</Label>
                <Input
                    id="item-name"
                    placeholder={isShoppingListTarget ? "e.g., Milk" : "e.g., Chicken Breast"}
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="mt-2"
                />
              </div>

              {/* Quantity Input (Conditional rendering) */}
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
                    onClick={handleCloseDialog}
                >
                  Cancel
                </Button>
                <Button
                    onClick={handleAddItem}
                    // Disabled if name is empty, OR (it's a pantry item AND quantity is empty)
                    disabled={!newItemName.trim() || (!isShoppingListTarget && !newItemQuantity.trim())}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {isShoppingListTarget ? "Add to List" : "Add to Pantry"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
  );
}
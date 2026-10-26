import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  UtensilsCrossed, Plus, CheckCircle2, Circle, Trash2, Edit3,
  Flame, Apple, Droplet
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ProgressBar from '../components/common/ProgressBar';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getAllItems, createItem, updateItem, deleteItem } from '../services/storage';
import type { Meal, MealType, MealFood } from '../types';

export default function NutritionPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [meals, setMeals] = useState<Meal[]>([]);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [mealToDelete, setMealToDelete] = useState<Meal | null>(null);

  // Form State
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [customName, setCustomName] = useState('');
  const [time, setTime] = useState('08:00');
  const [notes, setNotes] = useState('');
  const [foodsList, setFoodsList] = useState<MealFood[]>([]);

  // Food Sub-Form
  const [foodName, setFoodName] = useState('');
  const [foodQuantity, setFoodQuantity] = useState('');
  const [foodCalories, setFoodCalories] = useState('');
  const [foodProtein, setFoodProtein] = useState('');
  const [foodCarbs, setFoodCarbs] = useState('');
  const [foodFat, setFoodFat] = useState('');

  const loadMeals = () => {
    if (!user) return;
    setMeals(getAllItems<Meal>('meals', user.id));
  };

  useEffect(() => {
    loadMeals();
  }, [user]);

  // Macro Totals
  const totalCalories = meals.reduce((acc, m) => acc + m.foods.reduce((sum, f) => sum + (f.calories || 0), 0), 0);
  const totalProtein = meals.reduce((acc, m) => acc + m.foods.reduce((sum, f) => sum + (f.protein || 0), 0), 0);
  const totalCarbs = meals.reduce((acc, m) => acc + m.foods.reduce((sum, f) => sum + (f.carbs || 0), 0), 0);
  const totalFat = meals.reduce((acc, m) => acc + m.foods.reduce((sum, f) => sum + (f.fat || 0), 0), 0);

  const targetCalories = 2400;
  const targetProtein = 160;
  const targetCarbs = 250;
  const targetFat = 70;

  const openCreateModal = () => {
    setEditingMeal(null);
    setMealType('breakfast');
    setCustomName('');
    setTime('08:00');
    setNotes('');
    setFoodsList([]);
    setIsModalOpen(true);
  };

  const openEditModal = (m: Meal) => {
    setEditingMeal(m);
    setMealType(m.type);
    setCustomName(m.custom_name || '');
    setTime(m.time || '08:00');
    setNotes(m.notes || '');
    setFoodsList(m.foods || []);
    setIsModalOpen(true);
  };

  const addFoodToForm = () => {
    if (!foodName.trim()) return;
    const newFood: MealFood = {
      name: foodName.trim(),
      quantity: foodQuantity.trim() || undefined,
      calories: foodCalories ? parseFloat(foodCalories) : undefined,
      protein: foodProtein ? parseFloat(foodProtein) : undefined,
      carbs: foodCarbs ? parseFloat(foodCarbs) : undefined,
      fat: foodFat ? parseFloat(foodFat) : undefined,
    };
    setFoodsList(prev => [...prev, newFood]);
    setFoodName('');
    setFoodQuantity('');
    setFoodCalories('');
    setFoodProtein('');
    setFoodCarbs('');
    setFoodFat('');
  };

  const removeFoodFromForm = (index: number) => {
    setFoodsList(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (editingMeal) {
      updateItem<Meal>('meals', user.id, editingMeal.id, {
        type: mealType,
        custom_name: customName.trim() || undefined,
        time,
        foods: foodsList,
        notes: notes.trim() || undefined,
      });
      addToast({ type: 'success', title: 'Refeição atualizada!' });
    } else {
      createItem<Meal>('meals', user.id, {
        user_id: user.id,
        type: mealType,
        custom_name: customName.trim() || undefined,
        date: format(new Date(), 'yyyy-MM-dd'),
        time,
        foods: foodsList,
        completed: false,
        notes: notes.trim() || undefined,
      });
      addToast({ type: 'success', title: 'Refeição cadastrada!' });
    }

    setIsModalOpen(false);
    loadMeals();
  };

  const handleToggleComplete = (m: Meal) => {
    if (!user) return;
    updateItem<Meal>('meals', user.id, m.id, {
      completed: !m.completed,
    });
    setMeals(prev => prev.map(meal => meal.id === m.id ? { ...meal, completed: !meal.completed } : meal));
    addToast({
      type: 'info',
      title: !m.completed ? 'Refeição concluída!' : 'Refeição marcada como pendente',
    });
  };

  const handleDeleteMeal = () => {
    if (!mealToDelete || !user) return;
    deleteItem<Meal>('meals', user.id, mealToDelete.id);
    setMeals(prev => prev.filter(m => m.id !== mealToDelete.id));
    setMealToDelete(null);
    addToast({ type: 'success', title: 'Refeição excluída!' });
  };

  const mealTypeLabels: Record<MealType, string> = {
    breakfast: 'Café da Manhã',
    morning_snack: 'Lanche da Manhã',
    lunch: 'Almoço',
    afternoon_snack: 'Lanche da Tarde',
    dinner: 'Jantar',
    supper: 'Ceia',
    custom: 'Personalizada',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>Alimentação & Nutrição</h1>
          <p className="text-sm text-secondary" style={{ margin: '4px 0 0' }}>
            Planejamento alimentar diário e acompanhamento de macronutrientes.
          </p>
        </div>

        <Button variant="primary" onClick={openCreateModal}>
          <Plus size={18} /> Nova Refeição
        </Button>
      </div>

      {/* Macros Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span className="text-xs font-semibold text-secondary uppercase flex items-center gap-1">
              <Flame size={14} style={{ color: '#ea580c' }} /> Calorias
            </span>
            <span className="text-xs font-bold text-primary">{totalCalories} / {targetCalories} kcal</span>
          </div>
          <ProgressBar value={totalCalories} max={targetCalories} color="#ea580c" size="sm" />
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span className="text-xs font-semibold text-secondary uppercase flex items-center gap-1">
              <Apple size={14} style={{ color: '#dc2626' }} /> Proteínas
            </span>
            <span className="text-xs font-bold text-primary">{totalProtein}g / {targetProtein}g</span>
          </div>
          <ProgressBar value={totalProtein} max={targetProtein} color="#dc2626" size="sm" />
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span className="text-xs font-semibold text-secondary uppercase flex items-center gap-1">
              <Apple size={14} style={{ color: '#3b82f6' }} /> Carboidratos
            </span>
            <span className="text-xs font-bold text-primary">{totalCarbs}g / {targetCarbs}g</span>
          </div>
          <ProgressBar value={totalCarbs} max={targetCarbs} color="#3b82f6" size="sm" />
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span className="text-xs font-semibold text-secondary uppercase flex items-center gap-1">
              <Droplet size={14} style={{ color: '#d97706' }} /> Gorduras
            </span>
            <span className="text-xs font-bold text-primary">{totalFat}g / {targetFat}g</span>
          </div>
          <ProgressBar value={totalFat} max={targetFat} color="#d97706" size="sm" />
        </Card>
      </div>

      {/* Meals List */}
      {meals.length === 0 ? (
        <EmptyState
          icon={<UtensilsCrossed size={28} />}
          title="Nenhuma refeição registrada"
          description="Monte seu plano de refeições com alimentos, porções e valores nutricionais."
          actionLabel="Adicionar Refeição"
          onAction={openCreateModal}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
          {meals.map(meal => {
            const mealCalories = meal.foods.reduce((sum, f) => sum + (f.calories || 0), 0);
            const mealProtein = meal.foods.reduce((sum, f) => sum + (f.protein || 0), 0);

            return (
              <Card
                key={meal.id}
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => handleToggleComplete(meal)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: meal.completed ? '#16a34a' : 'var(--text-tertiary)' }}
                    >
                      {meal.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                    </button>
                    <span style={{ textDecoration: meal.completed ? 'line-through' : 'none' }}>
                      {meal.custom_name || mealTypeLabels[meal.type]}
                    </span>
                  </div>
                }
                subtitle={meal.time ? `Horário programado: ${meal.time}` : undefined}
                action={
                  <div style={{ display: 'flex', gap: 4 }}>
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(meal)} style={{ padding: 4 }}>
                      <Edit3 size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setMealToDelete(meal)} style={{ padding: 4 }}>
                      <Trash2 size={14} style={{ color: '#ef4444' }} />
                    </Button>
                  </div>
                }
                footer={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span>Total: <strong>{mealCalories} kcal</strong></span>
                    <span>Proteínas: <strong>{mealProtein}g</strong></span>
                  </div>
                }
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {meal.foods.map((food, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '6px 10px',
                        borderRadius: 'var(--border-radius-sm)',
                        backgroundColor: 'var(--surface-bg)',
                        fontSize: '0.85rem',
                      }}
                    >
                      <div>
                        <span className="font-medium">{food.name}</span>
                        {food.quantity && <span className="text-xs text-secondary ml-2">({food.quantity})</span>}
                      </div>
                      <div className="text-xs text-secondary font-mono">
                        {food.calories ? `${food.calories} kcal` : ''}
                      </div>
                    </div>
                  ))}
                </div>
                {meal.notes && (
                  <p className="text-xs text-secondary mt-2 italic">
                    "{meal.notes}"
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Meal Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMeal ? 'Editar Refeição' : 'Nova Refeição'}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, width: '100%' }}>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleSaveMeal}>Salvar Refeição</Button>
          </div>
        }
      >
        <form onSubmit={handleSaveMeal} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Tipo de Refeição</label>
              <select className="input" value={mealType} onChange={e => setMealType(e.target.value as any)}>
                <option value="breakfast">Café da Manhã</option>
                <option value="morning_snack">Lanche da Manhã</option>
                <option value="lunch">Almoço</option>
                <option value="afternoon_snack">Lanche da Tarde</option>
                <option value="dinner">Jantar</option>
                <option value="supper">Ceia</option>
                <option value="custom">Personalizada</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Horário</label>
              <input type="time" className="input" value={time} onChange={e => setTime(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Nome Personalizado (opcional)</label>
            <input
              type="text"
              className="input"
              placeholder="Ex: Shake Pós-Treino, Almoço de Domingo..."
              value={customName}
              onChange={e => setCustomName(e.target.value)}
            />
          </div>

          {/* Foods list builder */}
          <div>
            <label className="text-xs font-semibold text-secondary uppercase mb-1 block">Alimentos da Refeição</label>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 6, marginBottom: 8 }}>
              <input
                type="text"
                className="input"
                placeholder="Alimento (ex: Frango)"
                value={foodName}
                onChange={e => setFoodName(e.target.value)}
              />
              <input
                type="text"
                className="input"
                placeholder="Porção (ex: 150g)"
                value={foodQuantity}
                onChange={e => setFoodQuantity(e.target.value)}
              />
              <input
                type="number"
                className="input"
                placeholder="Calorias"
                value={foodCalories}
                onChange={e => setFoodCalories(e.target.value)}
              />
              <Button type="button" variant="outline" size="sm" onClick={addFoodToForm}>
                +
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 150, overflowY: 'auto' }}>
              {foodsList.map((f, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 8px',
                    borderRadius: 'var(--border-radius-sm)',
                    backgroundColor: 'var(--color-neutral-100)',
                    fontSize: '0.85rem',
                  }}
                >
                  <span>{f.name} {f.quantity ? `(${f.quantity})` : ''} - {f.calories || 0} kcal</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeFoodFromForm(i)} style={{ padding: 2 }}>
                    <Trash2 size={13} style={{ color: '#ef4444' }} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!mealToDelete}
        onClose={() => setMealToDelete(null)}
        onConfirm={handleDeleteMeal}
        title="Excluir Refeição"
        message="Tem certeza que deseja remover esta refeição do plano alimentar?"
      />
    </div>
  );
}

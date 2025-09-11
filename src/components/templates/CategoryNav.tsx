'use client'

interface Category {
  id: string
  name: string
  count: number
}

interface CategoryNavProps {
  categories: Category[]
  selectedCategory: string
  onCategoryChange: (categoryId: string) => void
}

export default function CategoryNav({ categories, selectedCategory, onCategoryChange }: CategoryNavProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`px-4 py-2 rounded-xl transition-all duration-200 ${
              selectedCategory === category.id
                ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md border border-gray-200'
            }`}
          >
            <span className="font-medium">{category.name}</span>
            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
              selectedCategory === category.id
                ? 'bg-blue-400 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {category.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

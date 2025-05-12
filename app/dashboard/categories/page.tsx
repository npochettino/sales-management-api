"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Edit, Trash2, AlertCircle } from "lucide-react"
import type { Category } from "@/lib/models/category"
import { categoryService } from "@/services/categoryService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { toast } from "@/components/ui/use-toast"

export default function CategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#6B7280",
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await categoryService.getCategories()
      if (response.success) {
        setCategories(response.data)
      } else {
        throw new Error("Failed to load categories")
      }
    } catch (err: any) {
      setError(err.message || "Failed to load categories")
      toast({
        title: "Error",
        description: err.message || "Failed to load categories",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddCategory = async () => {
    try {
      if (!formData.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Category name is required",
          variant: "destructive",
        })
        return
      }

      const response = await categoryService.createCategory(formData)
      if (response.success) {
        toast({
          title: "Success",
          description: "Category created successfully",
        })
        setIsAddDialogOpen(false)
        setFormData({ name: "", description: "", color: "#6B7280" })
        loadCategories()
      } else {
        throw new Error("Failed to create category")
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to create category",
        variant: "destructive",
      })
    }
  }

  const handleEditCategory = async () => {
    try {
      if (!currentCategory?._id) return
      if (!formData.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Category name is required",
          variant: "destructive",
        })
        return
      }

      const response = await categoryService.updateCategory(currentCategory._id.toString(), formData)
      if (response.success) {
        toast({
          title: "Success",
          description: "Category updated successfully",
        })
        setIsEditDialogOpen(false)
        setCurrentCategory(null)
        loadCategories()
      } else {
        throw new Error("Failed to update category")
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update category",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCategory = async () => {
    try {
      if (!currentCategory?._id) return

      const response = await categoryService.deleteCategory(currentCategory._id.toString())
      if (response.success) {
        toast({
          title: "Success",
          description: "Category deleted successfully",
        })
        setIsDeleteDialogOpen(false)
        setCurrentCategory(null)
        loadCategories()
      } else {
        throw new Error(response.message || "Failed to delete category")
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete category",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (category: Category) => {
    setCurrentCategory(category)
    setFormData({
      name: category.name,
      description: category.description || "",
      color: category.color || "#6B7280",
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (category: Category) => {
    setCurrentCategory(category)
    setIsDeleteDialogOpen(true)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <div className="flex items-center text-red-500 mb-4">
          <AlertCircle className="mr-2" />
          <span>Error loading categories</span>
        </div>
        <Button onClick={loadCategories}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Product Categories</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>Create a new product category to organize your inventory.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="name">Name</label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Category name"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="description">Description</label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Category description"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="color">Color</label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    name="color"
                    type="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="w-12 h-10 p-1"
                  />
                  <Input name="color" value={formData.color} onChange={handleInputChange} className="flex-1" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCategory}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          title="No categories found"
          description="Create your first product category to get started."
          action={
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Category
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div key={category._id?.toString()} className="border rounded-lg p-4 shadow-sm">
              <div className="flex items-center mb-2">
                <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: category.color || "#6B7280" }} />
                <h3 className="text-lg font-medium">{category.name}</h3>
              </div>
              {category.description && <p className="text-sm text-gray-500 mb-4">{category.description}</p>}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={() => openEditDialog(category)}>
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => openDeleteDialog(category)}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update the category details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="edit-name">Name</label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Category name"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-description">Description</label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Category description"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-color">Color</label>
              <div className="flex gap-2">
                <Input
                  id="edit-color"
                  name="color"
                  type="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-12 h-10 p-1"
                />
                <Input name="color" value={formData.color} onChange={handleInputChange} className="flex-1" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditCategory}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the category "{currentCategory?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

import React from 'react'
import CategoryForm from '../../_components/CategoryForm';
import { notFound } from 'next/navigation';
import prisma from '@/prisma/client';
const CategoryUpdatePage = async ({ params }: { params: { id: string } }) => {

  let category;

  try {
    category = await prisma.category.findUnique({ where: { id: params.id } })

    if (!category) notFound();
  } catch (err) {
    console.error("error", err);
    category = null;
  }
  // Convert null to undefined if necessary
  if (category == undefined) {
    return <div>not found category</div>;
  }






  return (
    <div>
      <CategoryForm category={category} />
    </div>
  )
}

export default CategoryUpdatePage
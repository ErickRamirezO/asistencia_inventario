"use client";

import { useEffect, useState } from "react";
import api from "@/utils/axios";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

export default function CategoriaStock() {
  const [stockData, setStockData] = useState([]);

  useEffect(() => {
    api.get("/categorias/stock")
      .then(res => setStockData(res.data))
      .catch(() => toast.error("Error al cargar el stock por categoría"));
  }, []);

  return (
    <div className="p-6 md:p-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Stock por Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border border-gray-300 dark:border-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Categoría</th>
                  <th className="px-4 py-2 text-left font-semibold">Cantidad</th>
                  <th className="px-4 py-2 text-left font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {stockData.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-6 text-gray-500">No hay datos disponibles.</td>
                  </tr>
                ) : (
                  stockData.map((item, index) => (
                    <tr key={index} className="border-t dark:border-gray-700">
                      <td className="px-4 py-2">{item.nombreCategoria}</td>
                      <td className="px-4 py-2">{item.cantidad}</td>
                      <td className="px-4 py-2">
                        <Button variant="outline" disabled>
                          <Pencil className="h-4 w-4 mr-2" /> Editar
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

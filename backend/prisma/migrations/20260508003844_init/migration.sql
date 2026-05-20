-- CreateTable
CREATE TABLE "Destino" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "ubicacion" TEXT,
    "descripcion" TEXT,
    "precioPorNoche" DOUBLE PRECISION,
    "calificacionPromedio" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "imagenUrl" TEXT,
    "destacado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Destino_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Actividad" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "destinoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Actividad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reseña" (
    "id" SERIAL NOT NULL,
    "contenido" TEXT NOT NULL,
    "puntuacion" INTEGER NOT NULL,
    "destinoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reseña_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Actividad" ADD CONSTRAINT "Actividad_destinoId_fkey" FOREIGN KEY ("destinoId") REFERENCES "Destino"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reseña" ADD CONSTRAINT "Reseña_destinoId_fkey" FOREIGN KEY ("destinoId") REFERENCES "Destino"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

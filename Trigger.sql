/****** Object:  Trigger [dbo].[tr_Persons_GenerateEmail]    Script Date: 27/9/2025 19:12:43 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER   TRIGGER [dbo].[tr_Persons_GenerateEmail]
ON [dbo].[Persons]
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Evitar recursión infinita
    IF TRIGGER_NESTLEVEL() > 1
        RETURN;
    
    -- Variables para el proceso
    DECLARE @Name VARCHAR(100)
    DECLARE @LastName VARCHAR(100)
    DECLARE @PersonId INT  -- Cambiar a PersonId (PK)
    DECLARE @BaseEmail VARCHAR(200)
    DECLARE @FinalEmail VARCHAR(200)
    DECLARE @Counter INT
    DECLARE @FirstNameInitial CHAR(1)
    DECLARE @LastNamePart VARCHAR(50)
    
    -- Cursor para procesar registros insertados que no tienen email
    -- IMPORTANTE: Usar PersonId (PK), no IdPerson
    DECLARE person_cursor CURSOR LOCAL FAST_FORWARD FOR
    SELECT PersonId, Name, LastName  -- PersonId es la PK
    FROM inserted
    WHERE PlatformMail IS NULL OR LTRIM(RTRIM(PlatformMail)) = ''
    
    OPEN person_cursor
    FETCH NEXT FROM person_cursor INTO @PersonId, @Name, @LastName
    
    WHILE @@FETCH_STATUS = 0
    BEGIN
        BEGIN TRY
            -- Limpiar y preparar datos
            SET @Name = LTRIM(RTRIM(@Name))
            SET @LastName = LTRIM(RTRIM(@LastName))
            
            -- Generar email solo si hay datos válidos
            IF @Name IS NOT NULL AND @LastName IS NOT NULL AND @Name != '' AND @LastName != ''
            BEGIN
                -- Obtener la primera letra del nombre
                SET @FirstNameInitial = LEFT(@Name, 1)
                
                -- Obtener la primera palabra del apellido
                SET @LastNamePart = CASE 
                    WHEN CHARINDEX(' ', @LastName) > 0 
                    THEN LEFT(@LastName, CHARINDEX(' ', @LastName) - 1)
                    ELSE @LastName
                END
                
                -- Limpiar caracteres especiales y convertir a minúsculas
                SET @LastNamePart = LOWER(@LastNamePart)
                SET @LastNamePart = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(@LastNamePart, 'ñ', 'n'), 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o')
                SET @LastNamePart = REPLACE(REPLACE(REPLACE(REPLACE(@LastNamePart, 'ú', 'u'), 'ü', 'u'), 'ç', 'c'), ' ', '')
                
                -- Generar email base
                SET @BaseEmail = LOWER(@FirstNameInitial) + @LastNamePart + 'l@mail.com'
                SET @FinalEmail = @BaseEmail
                SET @Counter = 0
                
                -- Buscar email único
                WHILE EXISTS (SELECT 1 FROM Persons WHERE PlatformMail = @FinalEmail)
                BEGIN
                    SET @Counter = @Counter + 1
                    SET @FinalEmail = LOWER(@FirstNameInitial) + @LastNamePart + 'l' + CAST(@Counter AS VARCHAR(10)) + '@mail.com'
                END
                
                -- Actualizar el registro con el email generado usando PersonId (PK)
                UPDATE Persons 
                SET PlatformMail = @FinalEmail
                WHERE PersonId = @PersonId  -- Usar PersonId (PK)
            END
        END TRY
        BEGIN CATCH
            -- En caso de error, continuar con el siguiente registro
            PRINT 'Error generando email para PersonId: ' + CAST(@PersonId AS VARCHAR(10))
            PRINT 'Error: ' + ERROR_MESSAGE()
        END CATCH
        
        FETCH NEXT FROM person_cursor INTO @PersonId, @Name, @LastName
    END
    
    CLOSE person_cursor
    DEALLOCATE person_cursor
END
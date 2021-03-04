﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace HealthCare.Infrastructure
{
    internal interface IRepository<TEntity>
        where TEntity : class
    {
        TEntity GetById(object id);

        IEnumerable<TEntity> GetAll(
            Expression<Func<TEntity, bool>> filter = null,
            Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>> orderBy = null,
            string includeProperties = "");

        void Insert(TEntity entity);
        void InsertRange(IEnumerable<TEntity> entities);

        void Remove(object id);
        void Remove(TEntity entityToDelete);
        void RemoveRange(IEnumerable<TEntity> entities);

    }
}

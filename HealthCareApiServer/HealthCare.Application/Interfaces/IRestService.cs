using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;

namespace HealthCare.Application.Interfaces
{
    public interface IRestService<TModel>
        where TModel : class
    {
        TModel GetById(object id);

        IEnumerable<TModel> GetAll(
            Expression<Func<TModel, bool>> filter = null,
            Func<IQueryable<TModel>, IOrderedQueryable<TModel>> orderBy = null,
            string includeProperties = "");

        void Insert(TModel entity);
        void InsertRange(IEnumerable<TModel> entities);

        void Remove(object id);
        void Remove(TModel entityToDelete);
        void RemoveRange(IEnumerable<TModel> entities);
    }
}

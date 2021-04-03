using HealthCare.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace HealthCare.API.Controllers
{
    public abstract class RestController<TEntity, TModel> : ApiController
        where TEntity : class
        where TModel : class
    {
        
        public RestController(IUnitOfWork unitOfWork)
        {
            this.unitOfWork = unitOfWork;
            this.repository = GetRepository(typeof(TEntity));
        }

        [HttpGet]
        public IEnumerable<TEntity> Get()
        {
            var result = this.repository.GetAll();
            return result;
        }

        [HttpGet("{id}")]
        public virtual TEntity Get(int id)
        {
            var result = this.repository.GetById(id);
            return result;
        }

        [HttpPost]
        public virtual ActionResult Post(TModel requestModel)
        {
            var a = (TEntity)Activator.CreateInstance(typeof(TEntity), new object[] { requestModel });
            this.repository.Insert(a);
            unitOfWork.SaveChanges();
            return Ok();
        }

        [HttpPut("{id}")]
        public virtual void Put(int id, TModel requestModel)
        {

        }

        [HttpDelete("{id}")]
        public virtual void Delete(int id)
        {
            this.repository.Remove(id);
            this.unitOfWork.SaveChanges();
        }

        #region private members
        private IRepository<TEntity> GetRepository(Type entityType)
        {
            foreach (var property in this.unitOfWork.GetType().GetProperties())
            {
                if (property.PropertyType.GenericTypeArguments.FirstOrDefault().Name == entityType.Name)
                {
                    return (IRepository<TEntity>)property.GetValue(unitOfWork);
                }
            }
            return null;
        }

        private readonly IRepository<TEntity> repository;
        protected readonly IUnitOfWork unitOfWork;
        #endregion
    }
}

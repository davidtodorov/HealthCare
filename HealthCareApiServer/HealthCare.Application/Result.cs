using System;
using System.Collections.Generic;
using System.Text;

namespace HealthCare.Application
{
    public class Result
    {
        public bool Succeeded { get; private set; }

        public bool Failure => !this.Succeeded;

        public string Error { get; private set; }

        public static implicit operator Result(bool succeeded)
            => new Result { Succeeded = succeeded };

        public static implicit operator Result(string error)
            => new Result
            {
                Succeeded = false,
                Error = error
            };
    }
}
